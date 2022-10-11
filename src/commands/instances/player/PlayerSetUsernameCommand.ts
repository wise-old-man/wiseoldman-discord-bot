import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../../config';
import { updateUsername } from '../../../database/services/alias';
import { Command } from '../../../types';
import { encodeURL } from '../../../utils/strings';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

class PlayerSetUsernameCommand implements Command {
  global: boolean;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option.setName('username').setDescription('In-game username').setRequired(true)
      )
      .setName('setrsn')
      .setDescription('Set player username (alias)');
  }

  async execute(message: CommandInteraction) {
    const username = message.options.getString('username', true);
    const userId = message.user.id;

    try {
      await message.deferReply();
      const player = await womClient.players.getPlayerDetails({ username });

      await updateUsername(userId, player.displayName);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle('Player alias updated!')
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
        .setDescription(`<@${userId}> is now associated with the username \`${player.displayName}\`.`)
        .setFooter({ text: `They can now call any player command without including the username.` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.status === 400) {
        throw new CommandError(
          `Failed to find player with username \`${username}\``,
          'Maybe try to update that username with /update first?'
        );
      } else {
        throw new CommandError('Failed to update player alias.');
      }
    }
  }
}

export default new PlayerSetUsernameCommand();
