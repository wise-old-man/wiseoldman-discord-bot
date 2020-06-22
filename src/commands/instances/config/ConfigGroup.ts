import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { updateGroup } from '../../../database/services/server';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigGroup implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;

  constructor() {
    this.name = "Configure the server's Wise Old Man group.";
    this.template = '!config group {groupId}';
    this.requiresAdmin = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'config' && message.args.length >= 2 && message.args[0] === 'group';
  }

  async execute(message: ParsedMessage) {
    const groupId = this.getGroupId(message);

    if (groupId === -1) {
      throw new CommandError(`Invalid group id.`, 'Group Id must be a valid number.');
    }

    try {
      const group = await fetchGroupDetails(groupId);

      const guildId = message.source.guild?.id || '';
      await updateGroup(guildId, groupId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Server group updated`)
        .setDescription(`All announcements and commands will be in reference to **${group.name}**`)
        .addFields({ name: 'Page URL', value: `https://wiseoldman.net/groups/${groupId}` });

      message.respond(response);
    } catch (e) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError("Failed to update the server's group.");
      }
    }
  }

  getGroupId(message: ParsedMessage): number {
    const match = message.args.find(a => a !== 'group' && !isNaN(Number(a)));
    return match ? parseInt(match, 10) : -1;
  }
}

export default new ConfigGroup();
