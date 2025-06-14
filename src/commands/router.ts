import * as Sentry from '@sentry/node';
import { GuildMember, Interaction, EmbedBuilder } from 'discord.js';
import config from '../config';
import prometheus from '../services/prometheus';
import {
  BaseCommand,
  CommandError,
  hasModeratorRole,
  isAdmin,
  requiresAdminPermissions
} from '../utils';
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
import ClearNameChangeHistoryCommand from './instances/moderation/ClearNameChangeHistoryCommand';
import DeleteGroupCommand from './instances/moderation/DeleteGroupCommand';
import DeleteCompetitionCommand from './instances/moderation/DeleteCompetitionCommand';
import RemoveFromGroupCommand from './instances/moderation/RemoveFromGroupCommand';
import RemoveFromCompetitionCommand from './instances/moderation/RemoveFromCompetitionCommand';
import CreateAPIKeyCommand from './instances/moderation/CreateAPIKeyCommand';
import DeleteAnnotationCommand from './instances/moderation/DeletePlayerAnnotationCommand';
import AddPlayerAnnotation from './instances/moderation/AddPlayerAnnotationCommand';

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
  ResetCompetitionCodeCommand,
  ClearNameChangeHistoryCommand,
  DeleteGroupCommand,
  DeleteCompetitionCommand,
  RemoveFromGroupCommand,
  RemoveFromCompetitionCommand,
  CreateAPIKeyCommand,
  DeleteAnnotationCommand,
  AddPlayerAnnotation
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

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandMonitor = prometheus.trackCommand();

  const commandName = interaction.commandName;
  const subCommandName = interaction.options.getSubcommand(false);

  const fullCommandName = subCommandName ? `${commandName}:${subCommandName}` : commandName;

  try {
    const targetCommand = COMMANDS.find(cmd => cmd.slashCommand.name === commandName);

    if (!targetCommand) {
      throw new Error(`Error: Command not implemented: ${commandName}`);
    }

    await interaction.deferReply();

    if (
      requiresAdminPermissions(targetCommand, subCommandName) &&
      !isAdmin(interaction.member as GuildMember)
    ) {
      throw new CommandError('That command requires Admin permissions.');
    }

    if (targetCommand.moderation && !hasModeratorRole(interaction.member as GuildMember)) {
      interaction.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    await targetCommand.execute(interaction);

    commandMonitor.endTracking(fullCommandName, 1, interaction.guildId ?? undefined);
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    await interaction.followUp({ embeds: [buildErrorEmbed(error)] });
    commandMonitor.endTracking(fullCommandName, 0, interaction.guildId ?? 'unknown guild id');
  }
}

function buildErrorEmbed(error: Error) {
  const response = new EmbedBuilder().setColor(config.visuals.red);

  if (error instanceof CommandError) {
    response.setDescription(error.message);
    if (error.tip) response.setFooter({ text: error.tip });
  } else {
    response.setDescription('An unexpected error occurred.');
  }

  return response;
}
