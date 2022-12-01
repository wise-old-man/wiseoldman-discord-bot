import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '~/config';
import { updateBotChannel, updateChannelPreference } from '~/services/prisma';
import { BroadcastName, BroadcastType, Command, CommandConfig, CommandError, ErrorCode } from '~/utils';

const CONFIG: CommandConfig = {
  name: 'channel',
  description: "Configure the bot's broadcast channels.",
  options: [
    {
      type: 'string',
      required: true,
      name: 'broadcast_type',
      description: 'The broadcast type to configure.',
      choices: [
        { label: 'Default', value: BroadcastName[BroadcastType.DEFAULT] },
        { label: 'Competition status', value: BroadcastName[BroadcastType.COMPETITION_STATUS] },
        { label: 'Member name changed', value: BroadcastName[BroadcastType.MEMBER_NAME_CHANGED] },
        { label: 'Member HCIM died', value: BroadcastName[BroadcastType.MEMBER_HCIM_DIED] },
        { label: 'Member achievements', value: BroadcastName[BroadcastType.MEMBER_ACHIEVEMENTS] },
        { label: 'Members list changed', value: BroadcastName[BroadcastType.MEMBERS_LIST_CHANGED] }
      ]
    },
    {
      type: 'channel',
      required: true,
      name: 'broadcast_channel',
      description: 'The channel to which announcements are sent.',
      channelType: 0 //  Only add text channels
    },
    {
      type: 'string',
      name: 'status',
      description: `Enable or disable announcements of a certain type. Default channel cannot be disabled.`,
      choices: [
        { label: 'Enable', value: 'enable' },
        { label: 'Disable', value: 'disable' }
      ]
    }
  ]
};

class ConfigChannelCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guild?.id || '';

    if (!guildId || guildId.length === 0) {
      throw new CommandError(ErrorCode.NOT_IN_GUILD);
    }

    const status = interaction.options.getString('status');
    const channelType = interaction.options.getString('broadcast_type', true);
    const announcementChannel = interaction.options.getChannel('broadcast_channel', true);

    const broadcastName = BroadcastName[channelType as BroadcastType];

    let description = '';

    if (channelType === BroadcastType.DEFAULT) {
      await updateBotChannel(guildId, announcementChannel.id);
      description = `All group-related broadcasts will be sent to <#${announcementChannel.id}> by default.`;
    } else if (status === 'disable') {
      await updateChannelPreference(guildId, channelType, null);
      description = `"${broadcastName}" broadcasts have now been disabled.`;
    } else {
      await updateChannelPreference(guildId, channelType, announcementChannel.id);
      description = `"${broadcastName}" broadcasts will now be sent to <#${announcementChannel.id}>`;
    }

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle(`✅ Channel Preferences Updated`)
      .setDescription(description);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigChannelCommand();
