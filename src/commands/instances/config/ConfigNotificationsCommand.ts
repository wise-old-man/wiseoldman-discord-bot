import { Channel, CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateBotDefaultChannel, updateNotificationPreferences } from '../../../services/prisma';
import {
  NotificationName,
  NotificationType,
  Command,
  CommandConfig,
  CommandError,
  getMissingPermissions,
  isChannelSendable
} from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'notifications',
  description: "Configure the bot's notification preferences.",
  options: [
    {
      type: 'string',
      required: true,
      name: 'notification_type',
      description: 'The notification type to configure.',
      choices: [
        ...Object.values(NotificationType).map(type => ({
          label: NotificationName[type],
          value: type
        }))
      ]
    },
    {
      type: 'channel',
      required: true,
      name: 'notification_channel',
      description: 'The channel to which notifications are sent.',
      channelType: 0 //  Only add text channels
    },
    {
      type: 'string',
      name: 'status',
      description: `Enable or disable notifications of a certain type. Default channel cannot be disabled.`,
      choices: [
        { label: 'Enable', value: 'enable' },
        { label: 'Disable', value: 'disable' }
      ]
    }
  ]
};

class ConfigNotificationsCommand extends Command {
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
    const channel = interaction.options.getChannel('notification_channel', true) as Channel;
    const notificationType = interaction.options.getString('notification_type', true);

    const notificationName = NotificationName[notificationType as NotificationType];

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

    if (notificationType === NotificationType.DEFAULT) {
      await updateBotDefaultChannel(guildId, channel.id);
      description = `All group-related notifications will be sent to <#${channel.id}> by default.`;
    } else if (status === 'disable') {
      await updateNotificationPreferences(guildId, notificationType, null);
      description = `"${notificationName}" notifications have now been disabled.`;
    } else {
      await updateNotificationPreferences(guildId, notificationType, channel.id);
      description = `"${notificationName}" notifications will now be sent to <#${channel.id}>`;
    }

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle(`✅ Notification Preferences Updated`)
      .setDescription(description);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigNotificationsCommand();
