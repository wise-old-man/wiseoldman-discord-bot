import { Interaction, MessageEmbed, GuildMember, CommandInteraction } from 'discord.js';
import config from '../config';
import { getEmoji, isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import { SubCommand } from '../types';
import {
  getCountryOptions,
  getPeriodOptions,
  getMetricOptions,
  getHelpCategoryOptions
} from '../utils/autocomplete';
import { approve, deny } from '../api/modules/names';

export function onError(options: { interaction: Interaction; title: string; tip?: string }): void {
  const response = new MessageEmbed().setColor(config.visuals.red).setDescription(options.title);
  response.setFooter({ text: options.tip ? options.tip : '' });

  if (options.interaction && options.interaction.isCommand()) {
    options.interaction.followUp({ embeds: [response] });
  }
}

export async function executeSubCommand(
  message: CommandInteraction,
  subcommand: string,
  candidates: SubCommand[]
): Promise<void> {
  try {
    await candidates.find(c => c.slashCommand?.name === subcommand)?.execute(message);
  } catch (e) {
    if (e instanceof CommandError) {
      return onError({ interaction: message, title: e.message, tip: e.tip });
    }
  }
}

// Slash commands
export async function onInteractionReceived(interaction: Interaction): Promise<void> {
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);
    const currentValue = focused.value?.toString();

    if (focused.name === 'country') {
      interaction.respond(getCountryOptions(currentValue).slice(0, 25));
    } else if (focused.name === 'period') {
      interaction.respond(getPeriodOptions(currentValue));
    } else if (focused.name === 'metric') {
      interaction.respond(getMetricOptions(currentValue).slice(0, 25));
    } else if (focused.name === 'category') {
      // for custom commands
      interaction.respond(getHelpCategoryOptions(currentValue));
    }
  }

  if (interaction.isButton() && interaction.inCachedGuild()) {
    const [actionName, ...values] = interaction.customId.split('/');

    // Prevents from interfering with paginated message buttons
    if (!actionName.includes('namechange')) return;

    const message = interaction.message;
    const embed = new MessageEmbed(message.embeds[0]).setColor(config.visuals.red);
    let decision = 'Canceled';
    if (actionName === 'namechange_approve') {
      try {
        await approve(parseInt(values[0]));
        embed.setFooter({ text: `Approved ${getEmoji('success')}` }).setColor(config.visuals.green);
        decision = 'Approved';
      } catch (error) {
        embed.setFooter({ text: `${getEmoji('warning')} Failed to approve name change` });
        decision = 'Unsuccessful';
      }
    } else if (actionName === 'namechange_deny') {
      try {
        await deny(parseInt(values[0]));
        embed.setFooter({ text: `Denied ${getEmoji('error')}` });
        decision = 'Denied';
      } catch (error) {
        embed.setFooter({ text: `${getEmoji('warning')} Failed to deny name change` });
      }
    }
    message.edit({ embeds: [embed], components: [] });
    await interaction.reply({ ephemeral: true, content: `The name change was **${decision}**` });
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
