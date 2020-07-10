import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupGained } from '../../../api/modules/groups';
import { GroupGainedEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getAbbreviation, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupGained implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group gains';
    this.template = '!group gained {metric}? [--day/--week/--month/--year]';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'gained';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.originServer?.groupId || -1;
    const metric = this.getMetricArg(message.args);
    const period = this.getPeriodArg(message.args);

    try {
      const group = await fetchGroupDetails(groupId);
      const gained = await fetchGroupGained(groupId, period, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
        .setDescription(this.buildList(gained))
        .setURL(`https://wiseoldman.net/groups/${groupId}/gained/`)
        .setFooter(`Tip: Try !group gained zulrah --day`);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildList(gained: GroupGainedEntry[]) {
    return gained.map((g, i) => `${i + 1}. **${g.displayName}** - ${toKMB(g.gained)}`).join('\n');
  }

  getMetricArg(args: string[]): string {
    const matches = args.filter(a => !a.startsWith('--') && a !== 'gained').join('');
    return matches && matches.length > 0 ? getAbbreviation(matches) : 'overall';
  }

  getPeriodArg(args: string[]): string {
    return args.find(a => a.startsWith('--'))?.replace('--', '') || 'week';
  }
}

export default new GroupGained();
