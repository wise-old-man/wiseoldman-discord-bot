import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../config';
import { BossResult, Command, MetricType, ParsedMessage } from '../../types';
import { getEmoji, getMetricName, MAX_FIELD_SIZE, toResults } from '../../utils';
import CommandError from '../CommandError';

class BossesCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'View player bosses killcount';
    this.template = '!bosses {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'bosses';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');

    try {
      const player = await this.fetchPlayer(username);

      const title = player.displayName;
      const url = `https://wiseoldman.net/players/${player.id}/overview/bossing`;
      const bossResults = <BossResult[]>toResults(player.latestSnapshot, MetricType.BOSS);
      const rankedResults = bossResults.filter(r => r.rank > -1 && r.kills > -1);

      if (rankedResults.length === 0) {
        throw new CommandError(`**${username}** is not ranked in any boss.`);
      }

      const responses = this.buildResponses(title, url, rankedResults);
      message.respond(responses);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async fetchPlayer(username: string) {
    const URL = `${config.baseAPIUrl}/players?username=${username}`;
    const { data } = await axios.get(URL);
    return data;
  }

  /**
   * For every 25 bosses, build an embed message displaying
   * their respective names, icons and killcounts.
   */
  buildResponses(title: string, url: string, bossResults: BossResult[]): MessageEmbed[] {
    const resultsPerMessage = MAX_FIELD_SIZE;
    const messageCount = Math.ceil(bossResults.length / resultsPerMessage);
    const responses: MessageEmbed[] = [];

    for (let i = 0; i < messageCount; i++) {
      const results = bossResults.slice(i * resultsPerMessage, (i + 1) * resultsPerMessage);
      const fields = this.buildBossFields(results);
      const footer = `Message (${i + 1}/${messageCount})`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(title)
        .setURL(url)
        .addFields(fields);

      // Doesn't make a lot of sense to show "Message 1/1",
      // so let's not set a footer for single message responses
      responses.push(messageCount === 1 ? response : response.setFooter(footer));
    }

    return responses;
  }

  buildBossFields(bossResults: BossResult[]): EmbedFieldData[] {
    // Convert each boss result into an embed field
    return bossResults.map(r => {
      const bossName = getMetricName(r.name);
      const bossEmoji = getEmoji('cooking');

      return {
        name: `${bossEmoji} ${bossName}`,
        value: `\`${r.kills}\``,
        inline: true
      };
    });
  }
}

export default new BossesCommand();
