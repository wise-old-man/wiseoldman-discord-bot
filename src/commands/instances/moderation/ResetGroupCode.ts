import { GuildMember, MessageEmbed } from 'discord.js';
import { resetCode } from '../../../api/modules/groups';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \`${code}\`. \nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

class ResetGroupCode implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = "Reset a group's verification code";
    this.template = '!reset-group-code {groupId} {userTag}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'reset-group-code' &&
      message.args.length >= 2 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond('Nice try. This command is reserved for Moderators and Admins.');
      return;
    }

    const groupId = this.getGroupId(message);
    const userId = this.getUserId(message);
    const user = this.getMember(message, userId);

    if (!groupId) throw new CommandError('Invalid group id.');
    if (!userId) throw new CommandError('Invalid user tag.');
    if (!user) throw new CommandError('Failed to find user from tag.');

    try {
      const { newCode } = await resetCode(groupId);

      // DM the user back with the new verification code
      await user.send(DM_MESSAGE(newCode));

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(CHAT_MESSAGE(userId));

      message.respond(response);
    } catch (error) {
      throw new CommandError('Failed to reset group verification code.');
    }
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

export default new ResetGroupCode();
