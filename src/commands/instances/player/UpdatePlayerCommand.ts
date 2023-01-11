import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command } from '../../../types';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

class UpdatePlayerCommand implements Command {
  global: boolean;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('update')
      .setDescription('Update player');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const result = await womClient.players.updatePlayer(username);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`Successfully updated **${result.displayName}**.`)
        .setFooter({
          text: 'Tip: You can keep yourself automatically updated through Runelite by enabling Wise Old Man in the "XP Updater" plugin.'
        });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.status === 500) {
        throw new CommandError('Failed to update: OSRS Hiscores are unavailable.');
      } else {
        throw new CommandError(e.response?.data?.message || `Failed to update **${username}**.`);
      }
    }
  }

  async getUsername(message: CommandInteraction): Promise<string | undefined | null> {
    const username = message.options.getString('username', false);
    if (username) return username;

    const inferredUsername = await getUsername(message.user.id);
    return inferredUsername;
  }
}

export default new UpdatePlayerCommand();
