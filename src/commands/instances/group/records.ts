import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { Command, ParsedMessage, RecordResult } from '../../../types';
import { formatDate, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class RecordsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'View group records';
    this.template = '!group records {period} {metric}';
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 2 && args[0] === 'records';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;
    const period = message.args[1];
    const metric = message.args.length >= 3 ? message.args[2] : 'overall';

    try {
      const group = await this.fetchGroupInfo(groupId);
      const records = await this.fetchGroupRecords(groupId, period, metric);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/records/`;
      const fields = this.buildRecordFields(records);
      const icon = getEmoji(metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${icon} ${group.name} ${getMetricName(metric)} records (${period})`)
        .setURL(pageURL)
        .addFields(fields);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildRecordFields(records: RecordResult[]): EmbedFieldData[] {
    return records.map((result, index) => {
      const name = result.displayName;
      const value = toKMB(result.value);
      const date = formatDate(new Date(result.updatedAt), "DD MMM 'YY");

      return {
        name: `${index + 1}. ${name}`,
        value: `\`${value}\` ${date}`,
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
   * Fetch group records from the API.
   */
  async fetchGroupRecords(id: number, period: string, metric: string) {
    const URL = `${config.baseAPIUrl}/groups/${id}/records`;
    const params = { metric: metric.toLowerCase(), period: period.toLowerCase(), limit: 21 };
    const { data } = await axios.get(URL, { params });

    return data;
  }
}

export default new RecordsCommand();
