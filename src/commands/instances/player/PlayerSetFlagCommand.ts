import { CountryProps, isCountry } from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { updateCountry } from '../../../services/wiseoldman';
import { Command, CommandConfig, countryCodeEmoji, CommandError } from '../../../utils';
import config from '../../../config';

const CONFIG: CommandConfig = {
  name: 'setflag',
  description: 'Set your country/flag',
  options: [
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.',
      required: true
    },
    {
      type: 'string',
      name: 'country',
      description: 'Country name.',
      required: true,
      autocomplete: true
    }
  ]
};

class PlayerSetFlagCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true);
    const countryCode = interaction.options.getString('country', true);

    if (
      interaction.guildId !== config.discord.guildId ||
      interaction.channelId !== config.discord.channels.flags
    ) {
      throw new CommandError(
        `This command only works in the **#change-flag** channel of the official Wise Old Man discord server.\
         Join us at https://wiseoldman.net/discord`
      );
    }

    if (!isCountry(countryCode)) {
      throw new CommandError(
        `Invalid country. You must supply a valid country code, according to the ISO 3166-1 standard.\
         Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
      );
    }

    const hasUpdated = await updateCountry(username, countryCode)
      .then(() => true)
      .catch(() => false);

    const title = hasUpdated
      ? `${countryCodeEmoji(countryCode)} Player flag updated!`
      : `❌ Failed to update flag`;

    const description = hasUpdated
      ? `${interaction.user} changed \`${username}\`'s country to ${CountryProps[countryCode].name}`
      : `Failed to update flag.`;

    const embed = new MessageEmbed()
      .setColor(hasUpdated ? config.visuals.green : config.visuals.red)
      .setTitle(title)
      .setDescription(description)
      .addFields([
        { name: 'Username', value: username },
        { name: 'Country Code:', value: countryCode }
      ]);

    if (!hasUpdated) {
      embed.setFooter({ text: 'The correct command format is: /setflag {username} {country_code}' });
    }

    await interaction.editReply({ embeds: [embed] });
  }
}

export default new PlayerSetFlagCommand();
