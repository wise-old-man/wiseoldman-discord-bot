import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { resetCode } from '../../../api/modules/competitions';
import config from '../../../config';
import { Command } from '../../../types';
import { hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \`${code}\`. \nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

class ResetCompetitionCode implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Competition id').setRequired(true)
      )
      .addUserOption(option =>
        option.setName('user').setDescription('Discord user tag').setRequired(true)
      )
      .setName('reset-competition-code')
      .setDescription("Reset a competition's verification code");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const competitionId = message.options.getInteger('id', true);
    const userId = message.options.getUser('user', true).id;
    const user = message.guild?.members.cache.find(m => m.id === userId);

    if (!user) throw new CommandError('Failed to find user from tag.');

    try {
      const { newCode } = await resetCode(competitionId);

      // DM the user back with the new verification code
      await user.send(DM_MESSAGE(newCode));

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(CHAT_MESSAGE(userId));

      await message.editReply({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to reset competition verification code.');
    }
  }
}

export default new ResetCompetitionCode();
