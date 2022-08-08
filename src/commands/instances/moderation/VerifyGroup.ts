import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { verify } from '../../../api/modules/groups';
import { Group } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

const CHAT_MESSAGE = (groupName: string) =>
  `${getEmoji('success')} \`${groupName}\` has been successfully verified!`;

const LOG_MESSAGE = (groupId: number, groupName: string, userId: string) =>
  `${groupName} (${groupId}) - <@${userId}>`;

class VerifyGroup implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Set a group as verified.';
    this.template = '!verify-group {groupId} {userTag}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'verify-group' &&
      message.args.length >= 2 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const groupId = this.getGroupId(message);
    const userId = this.getUserId(message);
    const user = this.getMember(message, userId);

    if (!groupId) throw new CommandError('Invalid group id.');
    if (!userId) throw new CommandError('Invalid user tag.');
    if (!user) throw new CommandError('Failed to find user from tag.');

    try {
      const group = await verify(groupId);

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(CHAT_MESSAGE(group.name));

      message.respond({ embeds: [response] });

      this.sendConfirmationLog(message, group, userId);
      this.addRole(user);
    } catch (error) {
      console.log(error);
      throw new CommandError('Failed to reset group verification code.');
    }
  }

  addRole(user: GuildMember) {
    user.roles.add(config.discord.roles.groupLeader).catch(console.log);
  }

  sendConfirmationLog(message: ParsedMessage, group: Group, userId: string) {
    const leadersLogChannel = message.sourceMessage.guild?.channels.cache.get(
      config.discord.channels.leadersLog
    );

    if (!leadersLogChannel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(leadersLogChannel)) return;

    leadersLogChannel.send(LOG_MESSAGE(group.id, group.name, userId));
  }

  getGroupId(message: ParsedMessage): number | null {
    const match = message.args.find(a => a !== 'group' && !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }

  getUserId(message: ParsedMessage): string | undefined {
    return message.args.find(a => a.startsWith('<@') && a.endsWith('>'))?.replace(/\D/g, '');
  }

  getMember(message: ParsedMessage, userId: string | undefined): GuildMember | undefined {
    if (!userId) return undefined;
    return message.sourceMessage.guild?.members.cache.find(m => m.id === userId);
  }
}

export default new VerifyGroup();
