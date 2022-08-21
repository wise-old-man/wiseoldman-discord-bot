import { Command } from '../../types';
import ConfigCommand from './config/ConfigRootCommand';
import HelpCommand from './general/HelpCommand';
import GroupCommand from './group/GroupRootCommand';
import ResetCompetitionCodeCommand from './moderation/ResetCompetitionCodeCommand';
import ResetGroupCodeCommand from './moderation/ResetGroupCodeCommand';
import VerifyGroupCommand from './moderation/VerifyGroupCommand';
import NameChangeCommand from './moderation/NameChangeCommand';
import DeletePlayerCommand from './moderation/DeletePlayerCommand';
import PlayerAchievements from './player/PlayerAchievementsCommand';
import PlayerActivitiesCommand from './player/PlayerActivitiesCommand';
import PlayerBossesCommand from './player/PlayerBossesCommand';
import PlayerEfficiencyCommand from './player/PlayerEfficiencyCommand';
import PlayerGainedCommand from './player/PlayerGainedCommand';
import PlayerSetFlagCommand from './player/PlayerSetFlagCommand';
import PlayerSetUsernameCommand from './player/PlayerSetUsernameCommand';
import PlayerStatsCommand from './player/PlayerStatsCommand';
import PlayerUpdateCommand from './player/UpdatePlayerCommand';

const commands: Command[] = [
  // general commands
  HelpCommand,

  // moderation commands
  ResetGroupCodeCommand,
  ResetCompetitionCodeCommand,
  VerifyGroupCommand,
  NameChangeCommand,
  DeletePlayerCommand,

  // player commands
  PlayerStatsCommand,
  PlayerBossesCommand,
  PlayerActivitiesCommand,
  PlayerAchievements,
  PlayerUpdateCommand,
  PlayerGainedCommand,
  PlayerEfficiencyCommand,
  PlayerSetUsernameCommand,
  PlayerSetFlagCommand,

  // group command
  GroupCommand,

  // config command
  ConfigCommand
];

export default commands;
