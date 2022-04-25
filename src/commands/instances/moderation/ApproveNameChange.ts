import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { approve } from '../../../api/modules/names';
import config from '../../../config';
import { Command } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class ApproveNameChange implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Name change id').setRequired(true)
      )
      .setName('approve-name')
      .setDescription('Approve a name change request');
  }

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const nameChangeId = message.options.getInteger('id', true);

    try {
      await message.deferReply();

      const nameChange = await approve(nameChangeId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(
          `${getEmoji('success')} Name change approved: ${nameChange.oldName} → ${nameChange.newName}`
        );

      await message.editReply({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to approve name change.');
    }
  }
}

export default new ApproveNameChange();
