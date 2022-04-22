import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { getChannelPreferences } from '../../../database/services/channelPreferences';
import { getServer } from '../../../database/services/server';
import { BroadcastType, Command, CustomCommand } from '../../../types';
import { getBroadcastName, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { customCommands } from '../../CustomCommands';

const BOT_URL = 'https://bot.wiseoldman.net';
const MAIN_URL = 'https://wiseoldman.net/discord';

const LINE_COMMANDS = `You can find the full commands list at:\n${BOT_URL}`;
const LINE_SUPPORT = `If you need any help or would like to follow the development of this project, join our discord at:\n${MAIN_URL}`;
const LINE_PERMS =
  "If some commands don't seem to be responding, it might be a permission related issue. Try to kick the bot and invite it back again. (link above)";

class Help implements Command {
  slashCommand?: SlashCommandBuilder;
  global?: boolean | undefined;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option.setName('category').setDescription('What do you need help with?').setAutocomplete(true)
      )
      .setName('help')
      .setDescription('Ask for help');
    this.global = true;
  }

  async execute(message: CommandInteraction) {
    if (!message.guild) return;
    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const botChannelId = server?.botChannelId;
    const category = message.options.getString('category');

    try {
      if (category) {
        customCommands.forEach((c: CustomCommand) => {
          if (c.command === category) {
            message.reply(c.image === undefined ? c.message : c.message + '\n' + c.image);
          }
        });
      } else {
        const group = groupId && groupId > -1 ? await fetchGroupDetails(groupId) : null;
        const channelPreferences = await getChannelPreferences(guildId);

        const fields = [
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

        message.reply({ embeds: [response] });
      }
    } catch (error) {
      throw new CommandError('Failed to load server settings.');
    }
  }
}

export default new Help();
