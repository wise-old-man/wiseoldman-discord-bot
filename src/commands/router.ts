import { Interaction } from 'discord.js';
import {
  getCountryOptions,
  getHelpCategoryOptions,
  getMetricOptions,
  getPeriodOptions
} from './utils/autocomplete';
import { BaseCommand } from './utils/commands';
import { getErrorResponse } from '../utils/error';
import ConfigRootCommand from './instances/config';
import HelpCommand from './instances/general/HelpCommand';
import GroupRootCommand from './instances/group';
import DeletePlayerCommand from './instances/moderation/DeletePlayerCommand';
import NameChangeCommand from './instances/moderation/NameChangeCommand';
import ResetCompetitionCodeCommand from './instances/moderation/ResetCompetitionCodeCommand';
import ResetGroupCodeCommand from './instances/moderation/ResetGroupCodeCommand';
import VerifyGroupCommand from './instances/moderation/VerifyGroupCommand';
import PlayerEfficiencyCommand from './instances/player/PlayerEfficiencyCommand';
import PlayerSetUsernameCommand from './instances/player/PlayerSetUsernameCommand';
import PlayerSetFlagCommand from './instances/player/PlayerSetFlagCommand';
import UpdatePlayerCommand from './instances/player/UpdatePlayerCommand';
import PlayerAchievementsCommand from './instances/player/PlayerAchievementsCommand';
import PlayerGainedCommand from './instances/player/PlayerGainedCommand';
import PlayerActivitiesCommand from './instances/player/PlayerActivitiesCommand';
import PlayerBossesCommand from './instances/player/PlayerBossesCommand';
import PlayerStatsCommand from './instances/player/PlayerStatsCommand';

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
    await interaction.followUp({ embeds: [getErrorResponse(error)] });
  }
}
