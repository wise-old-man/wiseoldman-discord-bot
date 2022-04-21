import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { deny } from '../../../api/modules/names';
import config from '../../../config';
import { Command } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class DenyNameChange implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Name change id').setRequired(true)
      )
      .setName('deny-name')
      .setDescription('Deny a name change request');
  }

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const nameChangeId = message.options.getInteger('id', true);

    try {
      const nameChange = await deny(nameChangeId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(
          `${getEmoji('success')} Name change denied: ${nameChange.oldName} → ${nameChange.newName}`
        );

      message.reply({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to deny name change.');
    }
  }
}

export default new DenyNameChange();
