import { Command } from '../../types';
import ConfigCommand from './config/Config';
import HelpCommand from './general/Help';
import GroupCommand from './group/Group';
import ResetCompetitionCode from './moderation/ResetCompetitionCode';
import ResetGroupCode from './moderation/ResetGroupCode';
import VerifyGroup from './moderation/VerifyGroup';
import NameChange from './moderation/NameChange';
import DeletePlayer from './moderation/DeletePlayer';
import PlayerAchievements from './player/PlayerAchievements';
import PlayerActivitiesCommand from './player/PlayerActivities';
import PlayerBossesCommand from './player/PlayerBosses';
import PlayerEfficiencyCommand from './player/PlayerEfficiency';
import PlayerGainedCommand from './player/PlayerGained';
import PlayerSetFlag from './player/PlayerSetFlag';
import PlayerSetUsername from './player/PlayerSetUsername';
import PlayerStatsCommand from './player/PlayerStats';
import PlayerUpdateCommand from './player/UpdatePlayer';

const commands: Command[] = [
  // general commands
  HelpCommand,

  // moderation commands
  ResetGroupCode,
  ResetCompetitionCode,
  VerifyGroup,
  NameChange,
  DeletePlayer,

  // player commands
  PlayerStatsCommand,
  PlayerBossesCommand,
  PlayerActivitiesCommand,
  PlayerAchievements,
  PlayerUpdateCommand,
  PlayerGainedCommand,
  PlayerEfficiencyCommand,
  PlayerSetUsername,
  PlayerSetFlag,

  // group command
  GroupCommand,

  // config command
  ConfigCommand
];

export default commands;
