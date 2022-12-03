import { GroupListItem } from '@wise-old-man/utils';
import {
  CommandInteraction,
  GuildChannelManager,
  GuildMember,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import { verifyGroup } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, hasModeratorRole } from '../../../utils';

const CHAT_MESSAGE = (groupName: string) => `✅ \`${groupName}\` has been successfully verified!`;

const LOG_MESSAGE = (groupId: number, groupName: string, userId: string) =>
  `${groupName} (${groupId}) - <@${userId}>`;

const CONFIG: CommandConfig = {
  name: 'verify-group',
  description: 'Set a group as verified.',
  options: [
    {
      type: 'integer',
      required: true,
      name: 'id',
      description: 'The group ID.'
    },
    {
      type: 'user',
      required: true,
      name: 'user',
      description: 'Discord user tag.'
    }
  ]
};

class VerifyGroupCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    if (!hasModeratorRole(interaction.member as GuildMember)) {
      interaction.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const groupId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const group = await verifyGroup(groupId);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(group.name));

    await interaction.followUp({ embeds: [response] });

    // Send a message to the WOM leaders log channel
    sendConfirmationLog(interaction.guild?.channels, group, userId);

    // Add the "Group Leader" role to the user
    user.roles.add(config.discord.roles.groupLeader).catch(console.log);
  }
}

function sendConfirmationLog(
  channels: GuildChannelManager | undefined,
  group: GroupListItem,
  userId: string
) {
  const leadersLogChannel = channels?.cache.get(config.discord.channels.leadersLog);

  if (!leadersLogChannel) return;
  if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(leadersLogChannel)) return;

  leadersLogChannel.send(LOG_MESSAGE(group.id, group.name, userId));
}

export default new VerifyGroupCommand();
