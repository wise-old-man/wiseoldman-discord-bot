import { Interaction, Message, MessageEmbed, GuildMember } from 'discord.js';
import config from '../config';
import { getMissingPermissions, isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import * as parser from './parser';
import { customCommands } from './CustomCommands';
import { CustomCommand } from '../types';
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
      const options = ['6h', 'Day', 'Week', 'Month', 'Year']
        .filter(period =>
          !currentValue
            ? true
            : [period.toLowerCase()].some(str => str.includes(currentValue.toLowerCase()))
        )
        .map(p => ({ name: p, value: p.toLowerCase() }));
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
    //TODO: when removing support for prefix commands the subcommand check can be removed
    // because only top level commands will be in the commands list.
    if (c.slashCommand?.name !== commandName || c.subcommand) return;

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

export async function onMessageReceived(message: Message): Promise<void> {
  if (!parser.isValid(message)) {
    return;
  }

  const parsed = await parser.parse(message);
  const missingPermissions = getMissingPermissions(message.guild?.me);

  if (missingPermissions && missingPermissions.length > 0) {
    return onError({
      message: message,
      title: `Error! Missing permissions: \n\n${missingPermissions.map(m => `\`${m}\``).join('\n')}`,
      tip: 'Contact your server administrator for help.'
    });
  }

  // Check for custom commands
  customCommands.forEach((c: CustomCommand) => {
    if (
      c.command === parsed.command &&
      (c.public || parsed.sourceMessage?.guild?.id === config.discord.guildId)
    ) {
      parsed.respond({ content: c.image === undefined ? c.message : c.message + '\n' + c.image });
    }
  });

  commands.forEach(async c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(parsed)) return;

    // If the message requires admin permissions and the
    // member who sent it is not an admin
    if (c.requiresAdmin && !isAdmin(message.member)) {
      return onError({
        message: message,
        title: 'That command requires Admin permissions.',
        tip: 'Contact your server administrator for help.'
      });
    }

    // If the message requires a group to be setup, and no group is defined
    // for the message's origin server
    if (c.requiresGroup && !(parsed.originServer && parsed.originServer.groupId)) {
      return onError({
        message: message,
        title: 'That command requires a group to be configured.',
        tip: `Start the group setup with /config group *groupId*`
      });
    }

    try {
      // Display bot is typing... indicator.
      message.channel.sendTyping();
      // All conditions are met, execute the command
      await c.execute(parsed);
    } catch (e) {
      // If a command error was thrown during execution, handle the response here.
      if (e instanceof CommandError) {
        return onError({ message: message, title: e.message, tip: e.tip });
      }
    }
  });
}
