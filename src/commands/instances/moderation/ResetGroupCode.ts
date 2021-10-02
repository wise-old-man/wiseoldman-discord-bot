import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
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
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = "Reset a group's verification code";
    this.template = '!reset-group-code {groupId} {userTag}';
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option => option.setName('id').setDescription('Group id').setRequired(true))
      .addUserOption(option =>
        option.setName('user').setDescription('Discord user tag').setRequired(true)
      )
      .setName('reset-group-code')
      .setDescription("Reset a group's verification code");
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'reset-group-code' &&
      message.args.length >= 2 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      if (!hasModeratorRole(message.member as GuildMember)) {
        message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
        return;
      }
      const groupId = message.options.getInteger('id', true);
      const userId = message.options.getUser('user', true).id;
      const user = message.guild?.members.cache.find(m => m.id === userId);

      if (!user) throw new CommandError('Failed to find user from tag.');

      try {
        const { newCode } = await resetCode(groupId);

        // DM the user back with the new verification code
        await user.send(DM_MESSAGE(newCode));

        // Respond on the WOM discord chat with a success status
        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setDescription(CHAT_MESSAGE(userId));

        message.reply({ embeds: [response] });
      } catch (error) {
        throw new CommandError('Failed to reset group verification code.');
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /reset-group-code {id} {user}'
      );
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
