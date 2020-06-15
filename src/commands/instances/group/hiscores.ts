import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupHiscores } from '../../../api/modules/group';
import { GroupHiscoresEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, isBoss, isSkill, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class HiscoresCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group hiscores';
    this.template = '!group hiscores {metric}';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'hiscores';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;
    const metric = message.args.length >= 2 ? message.args[1] : 'overall';

    try {
      const group = await fetchGroupDetails(groupId);
      const hiscores = await fetchGroupHiscores(groupId, metric);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/hiscores/`;
      const fields = this.buildHiscoresFields(metric, hiscores);
      const icon = getEmoji(metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${icon} ${group.name} ${getMetricName(metric)} Hiscores`)
        .setURL(pageURL)
        .addFields(fields);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildHiscoresFields(metric: string, hiscores: GroupHiscoresEntry[]): EmbedFieldData[] {
    return hiscores.map((result, index) => {
      const name = result.displayName;
      const value = this.getValue(metric, result);

      return {
        name: `${index + 1}. ${name}`,
        value: `\`${value}\``,
        inline: true
      };
    });
  }

  getValue(metric: string, result: GroupHiscoresEntry): string {
    if (isSkill(metric)) {
      return `${result.level} (${toKMB(result.experience || 0)})`;
    }

    if (isBoss(metric)) {
      return `${toKMB(result.kills || 0)}`;
    }

    return `${toKMB(result.score || 0)}`;
  }
}

export default new HiscoresCommand();
