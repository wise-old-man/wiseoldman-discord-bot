import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCountry } from '../../../api/modules/players';
import config from '../../../config';
import { Command } from '../../../types';
import { countryCodeEmoji, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { COUNTRIES } from '../../../utils/countries';

class PlayerSetFlagCommand implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option.setName('username').setDescription('In-game username').setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('country')
          .setDescription('Start typing your country name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .setName('setflag')
      .setDescription('Set player username (alias)');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();
    const username = message.options.getString('username', true);
    const countryCode = message.options.getString('country', true);

    const response = { message: '', isError: false };

    if (
      message.guild?.id !== config.discord.guildId ||
      message.channel?.id !== config.discord.channels.flags
    ) {
      throw new CommandError(
        'This command only works in the **#change-flag** channel of the official Wise Old Man discord server.\
          You can join at https://wiseoldman.net/discord'
      );
    }

    try {
      await updateCountry(username, countryCode);

      response.message = `${message.user} changed \`${username}\`'s country to ${
        COUNTRIES.find(c => c.code === countryCode)?.name
      }`;
      response.isError = false;
    } catch (e: any) {
      // The API's error message references country name, and this command
      // is restricted to country codes (for now), so let's hide that part of the message
      response.message = e.response?.data?.message?.replace(' or name', '') || 'Failed to update flag.';
      response.isError = true;
    }

    const embed = new MessageEmbed()
      .setColor(response.isError ? config.visuals.red : config.visuals.green)
      .setTitle(
        response.isError
          ? `${getEmoji('error')} Failed to update flag`
          : `${countryCodeEmoji(countryCode)} Player flag updated!`
      )
      .setDescription(response.message)
      .addFields([
        { name: 'Username', value: username },
        { name: 'Country Code:', value: countryCode }
      ]);

    if (response.isError) {
      embed.setFooter({ text: 'The correct command format is: /setflag {username} {country_code}' });
    }

    await message.editReply({ embeds: [embed] });
  }
}

export default new PlayerSetFlagCommand();
