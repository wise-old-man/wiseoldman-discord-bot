import { GuildMember, MessageEmbed } from 'discord.js';
import { resetCode } from '../../../api/modules/competitions';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \`${code}\`. \nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

class ResetCompetitionCode implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = "Reset a competition's verification code";
    this.template = '!reset-competition-code {competitionId} {userTag}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'reset-competition-code' && message.args.length >= 2;
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond('Nice try. This command is reserved for Moderators and Admins.');
      return;
    }

    const competitionId = this.getCompetitionId(message);
    const userId = this.getUserId(message);
    const user = this.getMember(message, userId);

    if (!competitionId) throw new CommandError('Invalid competition id.');
    if (!userId) throw new CommandError('Invalid user tag.');
    if (!user) throw new CommandError('Failed to find user from tag.');

    try {
      const { newCode } = await resetCode(competitionId);

      // DM the user back with the new verification code
      await user.send(DM_MESSAGE(newCode));

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(CHAT_MESSAGE(userId));

      message.respond(response);
    } catch (error) {
      console.log(error);
      throw new CommandError('Failed to reset competition verification code.');
    }
  }

  getCompetitionId(message: ParsedMessage): number | null {
    const match = message.args.find(a => a !== 'competition' && !isNaN(Number(a)));
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

export default new ResetCompetitionCode();
