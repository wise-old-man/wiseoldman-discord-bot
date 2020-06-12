import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../config';
import { Command, MetricType, ParsedMessage, SkillResult } from '../../types';
import { getEmoji, getLevel, getMetricName, getTotalLevel, toKMB, toResults } from '../../utils';

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
      const fields = this.buildStatsFields(player.latestSnapshot);
      const pageURL = `https://wiseoldman.net/players/${player.id}`;

      const response = new MessageEmbed()
        .setColor(config.color)
        .setTitle(player.displayName)
        .setURL(pageURL)
        .addFields(fields)
        .addField('Full player details at:', pageURL);

      message.respond(response);
    } catch (e) {
      const response = `**${username}** is not being tracked yet. Try \`!update ${username}\` first.`;
      message.respond(response);
    }
  }

  async fetchPlayer(username: string) {
    const URL = `${config.baseAPIUrl}/players?username=${username}`;
    const { data } = await axios.get(URL);
    return data;
  }

  buildStatsFields(snapshot: Object): EmbedFieldData[] {
    // Convert the snapshot into skill results
    const skillResults = <SkillResult[]>toResults(snapshot, MetricType.SKILL);

    // Calculatethe total level from the skill results
    const totalLevel = getTotalLevel(skillResults);

    // Convert each skill result into a embed field
    return skillResults.map(r => {
      const skillName = getMetricName(r.name);
      const skillEmoji = getEmoji(r.name);
      const experience = toKMB(r.experience);
      const level = r.name === 'overall' ? totalLevel : getLevel(r.experience);

      return {
        name: `${skillEmoji} ${skillName}`,
        value: `\`${level} (${experience})\``,
        inline: true
      };
    });
  }
}

export default new StatsCommand();
