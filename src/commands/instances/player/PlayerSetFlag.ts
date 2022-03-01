import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCountry } from '../../../api/modules/players';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { countryCodeEmoji, emojiCountryCode, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class PlayerSetFlag implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = 'Set player flag (country)';
    this.template = '!setflag {country_code} {username}';
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option
          .setName('country')
          .setDescription('Start typing your country name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option.setName('username').setDescription('In-game username').setRequired(true)
      )
      .setName('setflag')
      .setDescription('Set player username (alias)');
  }

  activated(message: ParsedMessage) {
    return message.command === 'setflag' && message.args.length >= 2;
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
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
        const result = await updateCountry(username, countryCode);
        response.message = result.message;
        response.isError = false;
      } catch (e: any) {
        // The API's error message references country name, and this command
        // is restricted to country codes (for now), so let's hide that part of the message
        response.message =
          e.response?.data?.message?.replace(' or name', '') || 'Failed to update flag.';
        response.isError = true;
      }

      const embed = new MessageEmbed()
        .setColor(response.isError ? config.visuals.red : config.visuals.green)
        .setTitle(
          response.isError
            ? `${getEmoji('error')} Failed to update flag`
            : `${countryCodeEmoji(countryCode)} Player flag updated!`
        )
        .setDescription(
          !response.isError
            ? `${message.user.toString()} changed \`${username}\`'s country to ${
                response.message.match('\\: (.*?) \\(.{2}\\)')?.[1]
              }`
            : response.message
        )
        .addFields([
          { name: 'Username', value: username },
          { name: 'Country Code:', value: countryCode }
        ]);

      if (response.isError) {
        embed.setFooter({ text: 'The correct command format is: !setflag {username} {country_code}' });
      }

      message.reply({ embeds: [embed] });
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /setflag {username} {country}'
      );
    }
  }

  getUsername(message: ParsedMessage): string {
    const usernameArgs = message.args.slice(0, message.args.length - 1);
    return usernameArgs.join(' ');
  }

  getCountryCode(message: ParsedMessage): string {
    const code = message.args[message.args.length - 1];

    if (code.length === 4) {
      return emojiCountryCode(code);
    }

    return code.toUpperCase();
  }
}

export default new PlayerSetFlag();
