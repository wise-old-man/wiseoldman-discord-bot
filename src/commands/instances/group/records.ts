import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupRecords } from '../../../api/modules/group';
import { GroupRecordEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { formatDate, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class RecordsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group records';
    this.template = '!group records {period} {metric}';
    this.requiresGroup = true;
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
      const group = await fetchGroupDetails(groupId);
      const records = await fetchGroupRecords(groupId, period, metric);
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

  buildRecordFields(records: GroupRecordEntry[]): EmbedFieldData[] {
    return records.map((result, index) => {
      const name = result.displayName;
      const value = toKMB(result.value);
      const date = formatDate(result.updatedAt, "DD MMM 'YY");

      return {
        name: `${index + 1}. ${name}`,
        value: `\`${value}\` ${date}`,
        inline: true
      };
    });
  }
}

export default new RecordsCommand();
