import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { getChannelPreferences } from '../../../database/services/channelPreferences';
import { BroadcastType, Command, ParsedMessage } from '../../../types';
import { getBroadcastName, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

const BOT_URL = 'https://bot.wiseoldman.net';
const MAIN_URL = 'https://wiseoldman.net/discord';

const LINE_COMMANDS = `You can find the full commands list at:\n${BOT_URL}`;
const LINE_SUPPORT = `If you need any help or would like to follow the development of this project, join our discord at:\n${MAIN_URL}`;
const LINE_PERMS =
  "If some commands don't seem to be responding, it might be a permission related issue. Try to kick the bot and invite it back again. (link above)";

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
    if (!message.originServer) return;
    const { groupId, guildId, prefix, botChannelId } = message.originServer;

    try {
      const group = groupId > -1 ? await fetchGroupDetails(groupId) : null;
      const channelPreferences = await getChannelPreferences(guildId);

      const fields = [
        { name: 'Prefix', value: prefix || config.defaultPrefix },
        { name: 'Tracked group', value: group ? group.name : 'none' },
        { name: 'Default Broadcast Channel', value: botChannelId ? `<#${botChannelId}>` : 'none' },
        ...channelPreferences.map(pref => ({
          name: `"${getBroadcastName(pref.type as BroadcastType)}" Broadcast Channel`,
          value: pref.channelId ? `<#${pref.channelId}>` : '`DISABLED`'
        }))
      ];

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji('info')} Need help?`)
        .setDescription(`${LINE_COMMANDS}\n\n${LINE_SUPPORT}\n\n${getEmoji('warning')}${LINE_PERMS}`)
        .addFields(fields);

      message.respond(response);
    } catch (error) {
      throw new CommandError('Failed to load server settings.');
    }
  }
}

export default new Help();
