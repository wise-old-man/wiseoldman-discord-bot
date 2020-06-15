import axios from 'axios';
import { EmbedFieldData } from 'discord.js';
import config from '../../../config';
import PlayerStatsTemplate from '../../../renderer/templates/PlayerStats';
import { Command, MetricType, ParsedMessage, SkillResult } from '../../../types';
import { getEmoji, getMetricName, toKMB, toResults } from '../../../utils';
import CommandError from '../../CommandError';

class StatsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'View player stats';
    this.template = '!stats {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'stats';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');

    try {
      const player = await this.fetchPlayer(username);
      /*
      const fields = this.buildStatsFields(player.latestSnapshot);
      const updatedAgo = durationSince(new Date(player.updatedAt), 2);
      const pageURL = `https://wiseoldman.net/players/${player.id}`;
      */

      /*
      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(player.displayName)
        .setURL(pageURL)
        .addFields(fields)
        .setFooter(`Last updated: ${updatedAgo} ago`);

      message.respond(response);
      */

      message.respond(await PlayerStatsTemplate.render(player));
    } catch (e) {
      console.log(e);
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  /**
   * Fetch the player details from the API.
   */
  async fetchPlayer(username: string) {
    const URL = `${config.baseAPIUrl}/players/username/${username}`;
    const { data } = await axios.get(URL);
    return data;
  }

  /**
   * Build the embed message's fields for each skill and its respective exp and level.
   */
  buildStatsFields(snapshot: Object): EmbedFieldData[] {
    // Convert the snapshot into skill results
    const skillResults = <SkillResult[]>toResults(snapshot, MetricType.Skill);

    // Convert each skill result into an embed field
    return skillResults.map(r => {
      const skillName = getMetricName(r.name);
      const skillEmoji = getEmoji(r.name);
      const experience = toKMB(r.experience);

      return {
        name: `${skillEmoji} ${skillName}`,
        value: `\`${r.level} (${experience})\``,
        inline: true
      };
    });
  }
}

export default new StatsCommand();
