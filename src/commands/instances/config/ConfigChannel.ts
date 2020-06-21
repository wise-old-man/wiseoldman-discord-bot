import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateAnnouncementChannel } from '../../../database/services/server';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigChannel implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Configure the prefered announcement channel.';
    this.template = '!config announcement-channel {#channel}/here';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'config' &&
      message.args.length >= 1 &&
      message.args[0] === 'announcement-channel'
    );
  }

  async execute(message: ParsedMessage) {
    const channelId = this.getChannel(message);

    if (channelId) {
      try {
        const guildId = message.source.guild?.id || '';
        await updateAnnouncementChannel(guildId, channelId);

        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setTitle(`${getEmoji('success')} Announcement channel updated`)
          .setDescription(`All automatic Wise Old Man announcements will be sent to <#${channelId}>`);

        message.respond(response);
      } catch (error) {
        throw new CommandError('Failed to update announcement channel.');
      }
    } else {
      throw new CommandError(
        `Couldn't find channel.`,
        'Try typing "!config announcement-channel here" on the intended channel.'
      );
    }
  }

  getChannel(message: ParsedMessage) {
    if (message.args.includes('here')) {
      return message.source.channel.id;
    }

    const channelTag = message.args.find(a => a.startsWith('<#'));

    if (!channelTag) {
      return null;
    }

    const channelId = channelTag.replace('<#', '').replace('>', '');
    const channel = message.source.guild?.channels.cache.get(channelId);

    if (channel) {
      return channel.id;
    }
  }
}

export default new ConfigChannel();
