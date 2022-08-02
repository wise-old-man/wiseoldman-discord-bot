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

    if (!prefix || !config.validPrefixes.includes(prefix)) {
      const validPrefixesString = config.validPrefixes.map(p => `\`${p}\``).join(',');
      throw new CommandError(
        `Invalid command prefix.\nValid prefixes: ${validPrefixesString}`,
        'If you have suggestions for other prefixes. Contact us on discord.'
      );
    }

    try {
      const guildId = message.sourceMessage.guild?.id || '';
      await updatePrefix(guildId, prefix);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Wise Old Man commands prefix updated`)
        .setDescription(
          `Prefix has been changed to **${prefix}** \n Example: \`${prefix}stats Zezima\``
        );

      message.respond({ embeds: [response] });
    } catch (e: any) {
      throw new CommandError("Failed to update the server's Wise Old Man command prefix.");
    }
  }

  getPrefix(message: ParsedMessage): string | undefined {
    return message.args.find(a => a !== 'prefix');
  }
}

export default new ConfigPrefix();
