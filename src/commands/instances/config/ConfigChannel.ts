import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { setChannelPreference } from '../../../database/services/channelPreferences';
import { updateBotChannel } from '../../../database/services/server';
import { SubCommand, ParsedMessage, BroadcastType } from '../../../types';
import { getEmoji, getBroadcastName } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigChannel implements SubCommand {
  name: string;
  template: string;
  requiresAdmin: boolean;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = 'Configure the default prefered broadcast channel.';
    this.template = '!config channel:default {#channel}/here';
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
          .setName('announcement_channel')
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
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'config' && args.length >= 2 && args[0] === 'channel';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      try {
        const guildId = message.guildId || '';
        const channelType = message.options.getString('channel_type', true);
        const announcementChannel = message.options.getChannel('announcement_channel', true);
        const status = message.options.getString('status');
        const broadcastName = getBroadcastName(channelType as BroadcastType);

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

        message.reply({ embeds: [response] });
      } catch (error: any) {
        if (error.message === "Couldn't find any valid channel argument.") {
          throw new CommandError(
            `Couldn't find channel.`,
            `You can tag a channel using # (Ex: #general).`
          );
        } else {
          throw new CommandError('Failed to update channel preferences.');
        }
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /config channel channel_type: #channel announcement_channel: #channel {status: [Enable/Disable]}'
      );
    }
  }
}

export default new ConfigChannel();
