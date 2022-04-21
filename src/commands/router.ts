import { Interaction, Message, MessageEmbed, GuildMember } from 'discord.js';
import config from '../config';
import { isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import { COUNTRIES } from '../utils/countries';
import { ALL_METRICS } from '../utils';

export function onError(options: {
  message?: Message;
  interaction?: Interaction;
  title: string;
  tip?: string;
}): void {
  const response = new MessageEmbed().setColor(config.visuals.red).setDescription(options.title);
  response.setFooter({ text: options.tip ? options.tip : '' });
  if (options.message) {
    options.message.channel.send({ embeds: [response] });
    return;
  } else if (options.interaction && options.interaction.isCommand()) {
    options.interaction.reply({ embeds: [response] });
  }
}

// Slash commands
export async function onInteractionReceived(interaction: Interaction): Promise<void> {
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);
    const currentValue = focused.value.toString();
    if (focused.name === 'country') {
      const options = COUNTRIES.filter(country =>
        !currentValue
          ? false
          : [country.name.toLowerCase(), country.code.toLowerCase()].some(str =>
              str.includes(currentValue.toLowerCase())
            )
      ).map(c => ({ name: c.name, value: c.code }));
      interaction.respond(options.slice(0, 25));
    } else if (focused.name === 'period') {
      const options = [
        { name: '5 Min', value: '5min' },
        { name: 'Day', value: 'day' },
        { name: 'Week', value: 'week' },
        { name: 'Month', value: 'month' },
        { name: 'Year', value: 'year' }
      ]
        .filter(period =>
          !currentValue
            ? true
            : [period.name.toLowerCase(), period.value].some(str =>
                str.includes(currentValue.toLowerCase())
              )
        )
        .map(p => ({ name: p.name, value: p.value }));
      interaction.respond(options);
    } else if (focused.name === 'metric') {
      const options = ALL_METRICS.filter(metric =>
        !currentValue
          ? true
          : [metric.name.toLowerCase(), metric.key].some(str => str.includes(currentValue.toLowerCase()))
      ).map(m => ({ name: m.name, value: m.key }));
      interaction.respond(options.slice(0, 25));
    }
  }

  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  commands.forEach(async c => {
    if (c.slashCommand?.name !== commandName) return;

    //TODO: check for admin permissions in a better way
    if (c.requiresAdmin && !isAdmin(interaction.member as GuildMember)) {
      return onError({
        interaction: interaction,
        title: 'That command requires Admin permissions.',
        tip: 'Contact your server administrator for help.'
      });
    }

    // TODO: Show a proper error when guild isn't configured yet

    try {
      interaction.channel?.sendTyping();

      await c.execute(interaction);
    } catch (e) {
      // If a command error was thrown during execution, handle the response here.
      if (e instanceof CommandError) {
        return onError({ interaction: interaction, title: e.message, tip: e.tip });
      }
    }
  });
}
