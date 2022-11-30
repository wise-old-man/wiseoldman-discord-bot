import { GroupListItem } from '@wise-old-man/utils';
import {
  CommandInteraction,
  GuildChannelManager,
  GuildMember,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import { verify } from '../../../api/modules/groups';
import config from '../../../config';
import { getEmoji, hasModeratorRole } from '../../../utils';
import { Command, CommandConfig } from '../../utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';

const CHAT_MESSAGE = (groupName: string) =>
  `${getEmoji('success')} \`${groupName}\` has been successfully verified!`;

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

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const groupId = message.options.getInteger('id', true);
    const userId = message.options.getUser('user', true).id;

    const user = message.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError(ErrorCode.USER_NOT_FOUND);
    }

    const group = await verify(groupId);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(group.name));

    await message.followUp({ embeds: [response] });

    // Send a message to the WOM leaders log channel
    this.sendConfirmationLog(message.guild?.channels, group, userId);

    // Add the "Group Leader" role to the user
    user.roles.add(config.discord.roles.groupLeader).catch(console.log);
  }

  sendConfirmationLog(channels: GuildChannelManager | undefined, group: GroupListItem, userId: string) {
    const leadersLogChannel = channels?.cache.get(config.discord.channels.leadersLog);

    if (!leadersLogChannel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(leadersLogChannel)) return;

    leadersLogChannel.send(LOG_MESSAGE(group.id, group.name, userId));
  }
}

export default new VerifyGroupCommand();
