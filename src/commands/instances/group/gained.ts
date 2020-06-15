import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { Command, GainedResult, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GainedCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group gains';
    this.template = '!group gained {period} {metric}';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 2 && args[0] === 'gained';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;
    const period = message.args[1];
    const metric = message.args.length >= 3 ? message.args[2] : 'overall';

    try {
      const group = await this.fetchGroupInfo(groupId);
      const gained = await this.fetchGroupGained(groupId, period, metric);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/gained/`;
      const fields = this.buildGainedFields(gained);
      const icon = getEmoji(metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${icon} ${group.name} ${getMetricName(metric)} gains (${period})`)
        .setURL(pageURL)
        .addFields(fields);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildGainedFields(gained: GainedResult[]): EmbedFieldData[] {
    return gained.map((result, index) => {
      const name = result.displayName;
      const value = toKMB(result.gained);

      return {
        name: `${index + 1}. ${name}`,
        value: `\`${value}\``,
        inline: true
      };
    });
  }

  /**
   * Fetch the group details from the API.
   */
  async fetchGroupInfo(id: number) {
    const URL = `${config.baseAPIUrl}/groups/${id}`;
    const { data } = await axios.get(URL);
    return data;
  }

  /**
   * Fetch group gains from the API.
   */
  async fetchGroupGained(id: number, period: string, metric: string) {
    const URL = `${config.baseAPIUrl}/groups/${id}/gained`;
    const params = { metric: metric.toLowerCase(), period: period.toLowerCase(), limit: 21 };
    const { data } = await axios.get(URL, { params });

    return data;
  }
}

export default new GainedCommand();
