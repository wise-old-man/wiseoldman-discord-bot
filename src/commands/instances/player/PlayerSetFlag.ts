import { MessageEmbed } from 'discord.js';
import { updateCountry } from '../../../api/modules/players';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { countryCodeEmoji, emojiCountryCode, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class PlayerSetFlag implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Set player flag (country)';
    this.template = '!setflag {country_code} {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'setflag' && message.args.length >= 2;
  }

  async execute(message: ParsedMessage) {
    const username = this.getUsername(message);
    const countryCode = this.getCountryCode(message);

    const response = { message: '', isError: false };

    if (
      message.sourceMessage?.guild?.id !== config.discord.guildId ||
      message.sourceMessage?.channel?.id !== config.discord.channels.flags
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
    } catch (e) {
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
      .setDescription(
        !response.isError
          ? `${message.sourceMessage.author.toString()} changed \`${username}\`'s country to ${response.message.match('\\: (.*?) \\(.{2}\\)')?.[1]}`
          : response.message)
      .addFields([
        { name: 'Username', value: username },
        { name: 'Country Code:', value: countryCode }
      ]);

    if (response.isError) {
      embed.setFooter('The correct command format is: !setflag {username} {country_code}');
    }

    message.respond(embed);
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
