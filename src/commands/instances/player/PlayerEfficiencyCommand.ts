import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatNumber, round } from '@wise-old-man/utils';
import config from '../../../config';
import { getUsername } from '../../../services/prisma';
import { Command } from '../../../types';
import { encodeURL } from '../../../utils';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

class PlayerEfficiencyCommand implements Command {
  global: boolean;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('ttm')
      .setDescription('View player efficiency stats');
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
      const player = await womClient.players.getPlayerDetails(username);

      if (player.ehp === 0 && player.tt200m === 0) {
        throw new CommandError(`This player is outdated. Please try "/update ${username}" first.`);
      }

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
        .setTitle(`${player.displayName} - Efficiency Stats`)
        .addFields([
          {
            name: 'Time To Max',
            value: player.ttm ? `${round(player.ttm, 2)} hours` : '---'
          },
          {
            name: 'Time To 200m All',
            value: player.tt200m ? `${round(player.tt200m, 2)} hours` : '---'
          },
          {
            name: 'Efficient Hours Played',
            value: player.ehp ? `${round(player.ehp, 2)}` : '---'
          },
          {
            name: 'Efficient Hours Bossed',
            value: player.ehb ? `${round(player.ehb, 2)}` : '---'
          },
          {
            name: 'Total Experience',
            value: player.exp ? `${formatNumber(player.exp, true)}` : '---'
          }
        ])
        .setFooter({ text: 'Last updated' })
        .setTimestamp(player.updatedAt);

      await message.editReply({ embeds: [embed] });
    } catch (e: any) {
      if (e instanceof CommandError) throw e;

      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try /update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async getUsername(message: CommandInteraction): Promise<string | undefined | null> {
    const username = message.options.getString('username', false);
    if (username) return username;

    const inferredUsername = await getUsername(message.user.id);
    return inferredUsername;
  }
}

export default new PlayerEfficiencyCommand();
