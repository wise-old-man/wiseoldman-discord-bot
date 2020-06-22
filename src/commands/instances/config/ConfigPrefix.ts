import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updatePrefix } from '../../../database/services/server';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigPrefix implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;

  constructor() {
    this.name = "Configure the server's Wise Old Man command prefix.";
    this.template = '!config prefix {prefix}';
    this.requiresAdmin = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'config' && message.args.length >= 2 && message.args[0] === 'prefix';
  }

  async execute(message: ParsedMessage) {
    const prefix = this.getPrefix(message);

    if (!prefix) {
      throw new CommandError(`Invalid command prefix.`, 'Example: !config prefix --');
    }

    if (prefix.length >= 5) {
      throw new CommandError(`Command prefix too long.`, 'Prefixes must be shorter than 5 characters');
    }

    try {
      const guildId = message.source.guild?.id || '';
      await updatePrefix(guildId, prefix);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Wise Old Man commands prefix updated`)
        .setDescription(
          `Prefix has been changed to **${prefix}** \n Example: \`${prefix}stats Zezima\``
        );

      message.respond(response);
    } catch (e) {
      throw new CommandError("Failed to update the server's Wise Old Man command prefix.");
    }
  }

  getPrefix(message: ParsedMessage): string | undefined {
    return message.args.find(a => a !== 'prefix');
  }
}

export default new ConfigPrefix();
