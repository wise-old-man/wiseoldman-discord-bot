import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { setChannelPreference } from '../../../database/services/channelPreferences';
import { updateBotChannel } from '../../../database/services/server';
import { SubCommand, BroadcastType } from '../../../types';
import { getEmoji, getBroadcastName } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigChannelCommand implements SubCommand {
  subcommand?: boolean;
  requiresAdmin: boolean;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.requiresAdmin = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addStringOption(option =>
        option
          .setName('broadcast_type')
          .setDescription('The broadcast type to configure')
          .setChoices([
            ['Default', BroadcastType.Default],
            ['Competition status', BroadcastType.CompetitionStatus],
            ['Member name changed', BroadcastType.MemberNameChanged],
            ['Member HCIM died', BroadcastType.MemberHardcoreDied],
            ['Member achievements', BroadcastType.MemberAchievements],
            ['Members list changed', BroadcastType.MembersListChanged]
          ])
          .setRequired(true)
      )
      .addChannelOption(option =>
        option
          .setName('broadcast_channel')
          .setDescription('The channel where announcements are sent')
          .addChannelType(0) // Only add text channels
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription(
            'Enable or disable announcements of a certain type. Default channel cannot be disabled.'
          )
          .setChoices([
            ['Enable', 'enable'],
            ['Disable', 'disable']
          ])
      )
      .setName('channel')
      .setDescription('Configure various broadcast channels');
  }

  async execute(message: CommandInteraction) {
    const guildId = message.guildId || '';
    const channelType = message.options.getString('broadcast_type', true);
    const announcementChannel = message.options.getChannel('broadcast_channel', true);
    const status = message.options.getString('status');
    const broadcastName = getBroadcastName(channelType as BroadcastType);

    try {
      await message.deferReply();

      let description = '';
      if (channelType === BroadcastType.Default) {
        await updateBotChannel(guildId, announcementChannel.id);
        description = `All group-related broadcasts will be sent to <#${announcementChannel.id}> by default.`;
      } else {
        if (status === 'disable') {
          await setChannelPreference(guildId, channelType, null);
          description = `"${broadcastName}" broadcasts have now been disabled.`;
        } else {
          await setChannelPreference(guildId, channelType, announcementChannel.id);
          description = `"${broadcastName}" broadcasts will now be sent to <#${announcementChannel.id}>`;
        }
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Channel Preferences Updated`)
        .setDescription(description);

      await message.editReply({ embeds: [response] });
    } catch (error: any) {
      throw new CommandError('Failed to update channel preferences.');
    }
  }
}

export default new ConfigChannelCommand();
