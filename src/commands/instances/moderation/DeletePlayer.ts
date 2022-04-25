import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { deletePlayer } from '../../../api/modules/players';
import config from '../../../config';
import { Command } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

class DeletePlayer implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option.setName('username').setDescription('Username to delete').setRequired(true)
      )
      .setName('delete-player')
      .setDescription('Delete a player from the database');
  }

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const username = message.options.getString('username', true);

    try {
      await message.deferReply();

      await deletePlayer(username);

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`${getEmoji('success')} \`${username}\` has been successfully deleted!`);

      await message.editReply({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to delete player.');
    }
  }
}

export default new DeletePlayer();
