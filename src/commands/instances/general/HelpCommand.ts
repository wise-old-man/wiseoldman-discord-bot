import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getChannelPreferences, getServer } from '../../../services/prisma';
import { Command, CommandConfig } from '../../utils/commands';
import { CUSTOM_COMMANDS } from '../../../commands/custom';
import { BroadcastType, getBroadcastName, getEmoji } from '../../../utils';
import { CommandError, ErrorCode } from '../../../utils/error';

const BOT_URL = 'https://bot.wiseoldman.net';
const MAIN_URL = 'https://wiseoldman.net/discord';

const LINE_COMMANDS = `You can find the full commands list at:\n${BOT_URL}`;
const LINE_SUPPORT = `If you need any help or would like to follow the development of this project, join our discord at:\n${MAIN_URL}`;
const LINE_PERMS = `If some commands don't seem to be responding, it might be a permission related issue. Try to kick the bot and invite it back again. (link above)`;

const CONFIG: CommandConfig = {
  name: 'help',
  description: 'Ask for help.',
  options: [
    {
      type: 'string',
      name: 'category',
      description: 'What do you need help with?',
      autocomplete: true
    }
  ]
};

class HelpCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    if (!interaction.inGuild()) {
      throw new CommandError(ErrorCode.NOT_IN_GUILD);
    }

    if (!interaction.guildId) {
      throw new CommandError(ErrorCode.UNDEFINED_GUILD_ID);
    }

    const { botChannelId, groupId, guildId } = await getServer(interaction.guildId);

    const category = interaction.options.getString('category');

    if (category) {
      const command = CUSTOM_COMMANDS.find(c => c.command === category);

      if (!command) {
        throw new CommandError(ErrorCode.INVALID_COMMAND);
      }

      const { image, message } = command;

      await interaction.editReply({
        content: image === undefined ? message : message + '\n' + image
      });

      return;
    }

    const group = groupId && groupId > -1 ? await womClient.groups.getGroupDetails(groupId) : null;
    const channelPreferences = await getChannelPreferences(guildId);

    const channelPreferencesDetails = channelPreferences.map(pref => ({
      name: `"${getBroadcastName(pref.type as BroadcastType)}" Broadcast Channel`,
      value: pref.channelId ? `<#${pref.channelId}>` : '`DISABLED`'
    }));

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('info')} Need help?`)
      .setDescription(`${LINE_COMMANDS}\n\n${LINE_SUPPORT}\n\n${getEmoji('warning')}${LINE_PERMS}`)
      .addFields([
        { name: 'Tracked group', value: group ? group.name : 'none' },
        { name: 'Default Broadcast Channel', value: botChannelId ? `<#${botChannelId}>` : 'none' },
        ...channelPreferencesDetails
      ]);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new HelpCommand();
