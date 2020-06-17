import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupGained } from '../../../api/modules/groups';
import { GroupGainedEntry } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GainedCommand implements Command {
  name: string;
  template: string;
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
    const groupId = message.server?.groupId || -1;
    const period = message.args[1];
    const metric = message.args.length >= 3 ? message.args[2] : 'overall';

    try {
      const group = await fetchGroupDetails(groupId);
      const gained = await fetchGroupGained(groupId, period, metric);
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

  buildGainedFields(gained: GroupGainedEntry[]): EmbedFieldData[] {
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
}

export default new GainedCommand();
