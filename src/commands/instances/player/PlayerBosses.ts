import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { BossResult, MetricType } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { durationSince, getEmoji, getMetricName, MAX_FIELD_SIZE } from '../../../utils';
import CommandError from '../../CommandError';

class BossesCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

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
      const player = await fetchPlayer(username);

      const title = player.displayName;
      const url = `https://wiseoldman.net/players/${player.id}/overview/bossing`;
      const updatedAgo = durationSince(player.updatedAt, 2);
      const bossResults = <BossResult[]>toResults(player.latestSnapshot, MetricType.Boss);
      const rankedResults = bossResults.filter(r => r.rank > -1 && r.kills > -1);

      if (rankedResults.length === 0) {
        throw new CommandError(`**${username}** is not ranked in any boss.`);
      }

      const responses = this.buildResponses(title, url, updatedAgo, rankedResults);
      message.respond(responses);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  /**
   * For every 25 bosses, build an embed message displaying
   * their respective names, icons and killcounts.
   */
  buildResponses(title: string, url: string, updated: string, results: BossResult[]): MessageEmbed[] {
    const resultsPerMessage = MAX_FIELD_SIZE;
    const messageCount = Math.ceil(results.length / resultsPerMessage);
    const responses: MessageEmbed[] = [];
    const footerTimeago = `Last updated: ${updated} ago`;

    for (let i = 0; i < messageCount; i++) {
      const currentResults = results.slice(i * resultsPerMessage, (i + 1) * resultsPerMessage);
      const fields = this.buildBossFields(currentResults);
      const paginationLabel = `Message (${i + 1}/${messageCount})`;
      const footer = messageCount === 1 ? footerTimeago : `${paginationLabel} • ${footerTimeago}`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(title)
        .setURL(url)
        .addFields(fields)
        .setFooter(footer);

      // Doesn't make a lot of sense to show "Message 1/1",
      // so let's not set a footer for single message responses
      responses.push(response);
    }

    return responses;
  }

  /**
   * Build the embed message's fields for each boss and its respective kc.
   */
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
