import { Command } from '../../types';
import ConfigChannel from './config/ConfigChannel';
import ConfigGroup from './config/ConfigGroup';
import ConfigPrefix from './config/ConfigPrefix';
import HelpCommand from './general/Help';
import GroupCompetitionCommand from './group/GroupCompetition';
import GroupCompetitionsCommand from './group/GroupCompetitions';
import GroupDetailsCommand from './group/GroupDetails';
import GroupGainedCommand from './group/GroupGained';
import GroupHiscoresCommand from './group/GroupHiscores';
import GroupMembersCommand from './group/GroupMembers';
import GroupRecordsCommand from './group/GroupRecords';
import PlayerAchievements from './player/PlayerAchievements';
import PlayerActivitiesCommand from './player/PlayerActivities';
import PlayerBossesCommand from './player/PlayerBosses';
import PlayerGainedCommand from './player/PlayerGained';
import PlayerSetUsername from './player/PlayerSetUsername';
import PlayerStatsCommand from './player/PlayerStats';
import PlayerVirtualsCommand from './player/PlayerVirtuals';
import PlayerUpdateCommand from './player/UpdatePlayer';

const commands: Command[] = [
  // general commands
  HelpCommand,

  // player commands
  PlayerStatsCommand,
  PlayerBossesCommand,
  PlayerActivitiesCommand,
  PlayerAchievements,
  PlayerUpdateCommand,
  PlayerGainedCommand,
  PlayerVirtualsCommand,
  PlayerSetUsername,

  // group commands
  GroupDetailsCommand,
  GroupMembersCommand,
  GroupHiscoresCommand,
  GroupRecordsCommand,
  GroupGainedCommand,
  GroupCompetitionCommand,
  GroupCompetitionsCommand,

  // config commands
  ConfigPrefix,
  ConfigChannel,
  ConfigGroup
];

export default commands;
