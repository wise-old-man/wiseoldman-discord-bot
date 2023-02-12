import { Channel, CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateBotChannel, updateChannelPreference } from '../../../services/prisma';
import {
  BroadcastName,
  BroadcastType,
  Command,
  CommandConfig,
  CommandError,
  getMissingPermissions,
  isChannelSendable
} from '../../../utils';

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
        ...Object.values(BroadcastType).map(type => ({
          label: BroadcastName[type],
          value: type
        }))
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
    this.requiresAdmin = true;
  }

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guild?.id || '';

    if (!guildId || guildId.length === 0) {
      throw new CommandError('This command can only be used in a Discord server.');
    }

    const status = interaction.options.getString('status');
    const channel = interaction.options.getChannel('broadcast_channel', true) as Channel;
    const broadcastType = interaction.options.getString('broadcast_type', true);

    const broadcastName = BroadcastName[broadcastType as BroadcastType];

    if (status !== 'disable') {
      if (!isChannelSendable(channel)) {
        throw new CommandError(`Error: <#${channel.id}> is not a valid text channel.`);
      }

      if (!channel.permissionsFor(channel.client.user).has('VIEW_CHANNEL')) {
        throw new CommandError(`Error: The bot does not have access to <#${channel.id}>.`);
      }

      const missingPermissions = getMissingPermissions(channel);

      if (missingPermissions.length > 0) {
        const missingPermissionsList = missingPermissions.map(p => `\`${p}\``).join(', ');

        throw new CommandError(
          `Error: The bot is missing the following permissions on <#${channel.id}>: \n\n${missingPermissionsList}`
        );
      }

      // As a last test, send an empty message to the channel to test permissions and delete it immediately afterwards
      await channel
        .send('​') // whitespace character
        .then(message => {
          return message.delete();
        })
        .catch(() => {
          throw new CommandError(
            `Error: <#${channel.id}> can't be selected. Please try another channel.`
          );
        });
    }

    let description = '';

    if (broadcastType === BroadcastType.DEFAULT) {
      await updateBotChannel(guildId, channel.id);
      description = `All group-related broadcasts will be sent to <#${channel.id}> by default.`;
    } else if (status === 'disable') {
      await updateChannelPreference(guildId, broadcastType, null);
      description = `"${broadcastName}" broadcasts have now been disabled.`;
    } else {
      await updateChannelPreference(guildId, broadcastType, channel.id);
      description = `"${broadcastName}" broadcasts will now be sent to <#${channel.id}>`;
    }

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle(`✅ Channel Preferences Updated`)
      .setDescription(description);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigChannelCommand();
