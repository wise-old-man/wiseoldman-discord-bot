import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupRecords } from '../../../api/modules/groups';
import { GroupRecordEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getAbbreviation, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupRecords implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group records';
    this.template = '!group records {metric}? [--6h/--day/--week/--month/--year]';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'records';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.originServer?.groupId || -1;
    const metric = this.getMetricArg(message.args);
    const period = this.getPeriodArg(message.args);

    try {
      const group = await fetchGroupDetails(groupId);
      const records = await fetchGroupRecords(groupId, period, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} records (${period})`)
        .setDescription(this.buildList(records))
        .setURL(`https://wiseoldman.net/groups/${groupId}/records/`)
        .setFooter({ text: `Tip: Try ${message.prefix}group records zulrah --day` });

      message.respond({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(records: GroupRecordEntry[]) {
    return records.map((g, i) => `${i + 1}. **${g.player.displayName}** - ${toKMB(g.value)}`).join('\n');
  }

  getMetricArg(args: string[]): string {
    const matches = args.filter(a => !a.startsWith('--') && a !== 'records').join('');
    return matches && matches.length > 0 ? getAbbreviation(matches) : 'overall';
  }

  getPeriodArg(args: string[]): string {
    return args.find(a => a.startsWith('--'))?.replace('--', '') || 'week';
  }
}

export default new GroupRecords();
