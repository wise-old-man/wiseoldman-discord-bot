import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { MetricType, SkillResult, Snapshot } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { durationSince, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class StatsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

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
      const player = await fetchPlayer(username);

      const fields = this.buildStatsFields(player.latestSnapshot);
      const updatedAgo = durationSince(player.updatedAt, 2);
      const pageURL = `https://wiseoldman.net/players/${player.id}`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(player.displayName)
        .setURL(pageURL)
        .addFields(fields)
        .setFooter(`Last updated: ${updatedAgo} ago`);

      message.respond(response);
    } catch (e) {
      console.log(e);
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  /**
   * Build the embed message's fields for each skill and its respective exp and level.
   */
  buildStatsFields(snapshot: Snapshot): EmbedFieldData[] {
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
