import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateBotChannel } from '../../../database/services/server';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigChannel implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;

  constructor() {
    this.name = 'Configure the default prefered broadcast channel.';
    this.template = '!config channel:default {#channel}/here';
    this.requiresAdmin = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'config' && args.length >= 2 && args[0] === 'channel:default';
  }

  async execute(message: ParsedMessage) {
    try {
      const guildId = message.sourceMessage.guild?.id || '';
      const channelId = this.getChannelId(message);

      await updateBotChannel(guildId, channelId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Default Channel Updated`)
        .setDescription(`All group-related broadcasts will be sent to <#${channelId}> by default.`)
        .setFooter(
          'You can customise these broadcasts further by using the !config channel:... commands. Visit bot.wiseoldman.net for more details.'
        );

      message.respond(response);
    } catch (error) {
      if (error.message === "Couldn't find any valid channel argument.") {
        throw new CommandError(
          `Couldn't find channel.`,
          `You can either tag a channel (Ex: #general) or use "here" (No quotes).`
        );
      } else {
        throw new CommandError('Failed to update default channel preference.');
      }
    }
  }

  getChannelId(message: ParsedMessage) {
    const channelArg = message.args[message.args.length - 1].toLowerCase();

    if (channelArg === 'here') return message.sourceMessage.channel.id;

    const channelTag = channelArg.startsWith('<#') ? channelArg : null;

    if (!channelTag) throw new Error("Couldn't find any valid channel argument.");

    const channelId = channelTag.replace('<#', '').replace('>', '');
    const channel = message.sourceMessage.guild?.channels.cache.get(channelId);

    if (!channel) throw new Error("Couldn't find any valid channel argument.");

    return channel.id;
  }
}

export default new ConfigChannel();
