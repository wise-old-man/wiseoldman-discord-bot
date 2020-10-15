import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupHiscores } from '../../../api/modules/groups';
import { GroupHiscoresEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import {
  getAbbreviation,
  getEmoji,
  getMetricName,
  isActivity,
  isBoss,
  isSkill,
  toKMB
} from '../../../utils';
import CommandError from '../../CommandError';

class GroupHiscores implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group hiscores';
    this.template = '!group hiscores {metric}?';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'hiscores';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.originServer?.groupId || -1;
    const metric = this.getMetricArg(message.args);

    try {
      const group = await fetchGroupDetails(groupId);
      const hiscores = await fetchGroupHiscores(groupId, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} hiscores`)
        .setDescription(this.buildList(metric, hiscores))
        .setURL(`https://wiseoldman.net/groups/${groupId}/records/`)
        .setFooter(`Tip: Try !group hiscores zulrah`);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildList(metric: string, hiscores: GroupHiscoresEntry[]) {
    return hiscores
      .map((g, i) => `${i + 1}. **${g.player.displayName}** - ${this.getValue(metric, g)}`)
      .join('\n');
  }

  getValue(metric: string, result: GroupHiscoresEntry): string {
    if (isSkill(metric)) {
      return `${result.level} (${toKMB(result.experience || 0)})`;
    }

    if (isBoss(metric)) {
      return `${toKMB(result.kills || 0)}`;
    }

    if (isActivity(metric)) {
      return `${toKMB(result.score || 0)}`;
    }

    return `${result.value || 0}`;
  }

  getMetricArg(args: string[]): string {
    return args.length >= 2 ? getAbbreviation(args[1]) : 'overall';
  }
}

export default new GroupHiscores();
