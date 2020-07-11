import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class Help implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Ask for help.';
    this.template = 'wom!help';
  }

  activated(message: ParsedMessage) {
    return message.sourceMessage.content.startsWith(config.helpCommand);
  }

  async execute(message: ParsedMessage) {
    const { originServer } = message;

    try {
      const groupId = message.originServer?.groupId || -1;
      const prefix = originServer?.prefix || config.defaultPrefix;
      const announcementChannelId = originServer?.botChannelId;
      const group = groupId > -1 ? await fetchGroupDetails(groupId) : null;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji('info')} Need help?`)
        .setDescription(
          `You can find the full commands list at:\nhttps://bot.wiseoldman.net/.\n\nIf you need any help or would like to follow the development of this project, join our discord at:\nhttps://wiseoldman.net/discord`
        )
        .addFields([
          {
            name: 'Prefix',
            value: prefix
          },
          {
            name: 'Announcement Channel',
            value: announcementChannelId ? `<#${announcementChannelId}>` : 'none'
          },
          {
            name: 'Tracked group',
            value: group ? group.name : 'none'
          }
        ]);

      message.respond(response);
    } catch (error) {
      throw new CommandError('Failed to load server settings.');
    }
  }
}

export default new Help();
