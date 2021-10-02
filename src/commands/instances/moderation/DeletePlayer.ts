import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { deletePlayer } from '../../../api/modules/players';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

class DeletePlayer implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = 'Delete a player and all its data.';
    this.template = '!delete-player {username}';
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option.setName('username').setDescription('Username to delete').setRequired(true)
      )
      .setName('delete-player')
      .setDescription('Delete a player from the database');
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'delete-player' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      if (!hasModeratorRole(message.member as GuildMember)) {
        message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
        return;
      }

      const username = message.options.getString('username', true);

      try {
        await deletePlayer(username);

        // Respond on the WOM discord chat with a success status
        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setDescription(`${getEmoji('success')} \`${username}\` has been successfully deleted!`);

        message.reply({ embeds: [response] });
      } catch (error) {
        throw new CommandError('Failed to delete player.');
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /delete-player {username}'
      );
    }
  }
}

export default new DeletePlayer();
