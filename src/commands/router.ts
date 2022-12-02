import { Interaction, MessageEmbed } from 'discord.js';
import config from '~/config';
import { BaseCommand, CommandError } from '~/utils';
import {
  getCountryOptions,
  getHelpCategoryOptions,
  getMetricOptions,
  getPeriodOptions
} from './autocomplete';
import ConfigRootCommand from './instances/config';
import HelpCommand from './instances/general/HelpCommand';
import GroupRootCommand from './instances/group';
import DeletePlayerCommand from './instances/moderation/DeletePlayerCommand';
import NameChangeCommand from './instances/moderation/NameChangeCommand';
import ResetCompetitionCodeCommand from './instances/moderation/ResetCompetitionCodeCommand';
import ResetGroupCodeCommand from './instances/moderation/ResetGroupCodeCommand';
import VerifyGroupCommand from './instances/moderation/VerifyGroupCommand';
import PlayerAchievementsCommand from './instances/player/PlayerAchievementsCommand';
import PlayerActivitiesCommand from './instances/player/PlayerActivitiesCommand';
import PlayerBossesCommand from './instances/player/PlayerBossesCommand';
import PlayerEfficiencyCommand from './instances/player/PlayerEfficiencyCommand';
import PlayerGainedCommand from './instances/player/PlayerGainedCommand';
import PlayerSetFlagCommand from './instances/player/PlayerSetFlagCommand';
import PlayerSetUsernameCommand from './instances/player/PlayerSetUsernameCommand';
import PlayerStatsCommand from './instances/player/PlayerStatsCommand';
import UpdatePlayerCommand from './instances/player/UpdatePlayerCommand';

export const COMMANDS: BaseCommand[] = [
  HelpCommand,
  // Player Commands
  PlayerStatsCommand,
  UpdatePlayerCommand,
  PlayerGainedCommand,
  PlayerBossesCommand,
  PlayerSetFlagCommand,
  PlayerActivitiesCommand,
  PlayerEfficiencyCommand,
  PlayerSetUsernameCommand,
  PlayerAchievementsCommand,
  // Group Commands
  GroupRootCommand,
  // Config Commands
  ConfigRootCommand,
  // Moderation Commands
  NameChangeCommand,
  VerifyGroupCommand,
  DeletePlayerCommand,
  ResetGroupCodeCommand,
  ResetCompetitionCodeCommand
];

export async function onInteractionReceived(interaction: Interaction) {
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

  try {
    const { commandName } = interaction;
    const targetCommand = COMMANDS.find(cmd => cmd.slashCommand.name === commandName);

    if (!targetCommand) {
      console.log('Error: Command not implemented', commandName);
      return;
    }

    await interaction.channel?.sendTyping();
    await interaction.deferReply();

    await targetCommand.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.followUp({ embeds: [buildErrorEmbed(error)] });
  }
}

function buildErrorEmbed(error: Error) {
  const response = new MessageEmbed().setColor(config.visuals.red);

  if (error instanceof CommandError) {
    response.setDescription(error.message);
    if (error.tip) response.setFooter({ text: error.tip });
  } else {
    response.setDescription('An unexpected error occurred.');
  }

  return response;
}
