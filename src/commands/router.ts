import { Interaction, MessageEmbed, GuildMember, CommandInteraction } from 'discord.js';
import config from '../config';
import { isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import { SubCommand } from '../types';
import {
  getCountryOptions,
  getPeriodOptions,
  getMetricOptions,
  getHelpCategoryOptions
} from '../utils/autocomplete';
import { getServer } from '../services/prisma';

export function onError(options: { interaction: Interaction; title: string; tip?: string }): void {
  const { interaction, title, tip } = options;

  const response = new MessageEmbed().setColor(config.visuals.red).setDescription(title);
  response.setFooter({ text: tip ? tip : '' });

  if (interaction && interaction.isCommand()) {
    interaction.followUp({ embeds: [response] });
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

  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  commands.forEach(async c => {
    if (c.slashCommand?.name !== commandName) return;

    //TODO: check for admin permissions in a better way
    if (c.requiresAdmin && !isAdmin(interaction.member as GuildMember)) {
      await interaction.deferReply();
      return onError({
        interaction: interaction,
        title: 'That command requires Admin permissions.',
        tip: 'Contact your server administrator for help.'
      });
    }

    if (c.requiresGroup) {
      if (!interaction.inGuild()) {
        await interaction.deferReply();
        return onError({
          interaction: interaction,
          title: 'This command only works in a server.'
        });
      }

      const server = await getServer(interaction.guildId);

      if (!server?.groupId) {
        await interaction.deferReply();
        return onError({
          interaction: interaction,
          title: 'That command requires a group to be configured.',
          tip: `Start the group setup with /config group.`
        });
      }
    }

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
