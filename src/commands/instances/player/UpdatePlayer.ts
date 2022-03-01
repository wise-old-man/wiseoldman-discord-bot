import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { updatePlayer } from '../../../api/modules/players';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import CommandError from '../../CommandError';

class UpdatePlayer implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;
  global: boolean;

  constructor() {
    this.name = 'Update player';
    this.template = '![update/track] {username}';
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('update')
      .setDescription('Update player');
    this.global = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'update' || message.command === 'track';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      // Grab the username from the command's arguments or database alias
      const username = await this.getUsername(message);

      if (!username) {
        throw new CommandError(
          'This commands requires a username. Set a default by using the `setrsn` command.'
        );
      }

      try {
        const result = await updatePlayer(username);

        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setDescription(`Successfully updated **${result.displayName}**.`)
          .setFooter({
            text: 'Tip: You can keep yourself automatically updated through Runelite by enabling Wise Old Man in the "XP Updater" plugin.'
          });

        message.reply({ embeds: [response] });
      } catch (e: any) {
        if (e.response?.status === 500) {
          throw new CommandError('Failed to update: OSRS Hiscores are unavailable.');
        } else {
          throw new CommandError(e.response?.data?.message || `Failed to update **${username}**.`);
        }
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /update {username}'
      );
    }
  }

  async getUsername(message: CommandInteraction): Promise<string | undefined | null> {
    const username = message.options.getString('username', false);
    if (username) return username;

    const inferredUsername = await getUsername(message.user.id);
    return inferredUsername;
  }
}

export default new UpdatePlayer();
