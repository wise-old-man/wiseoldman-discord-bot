import { Command } from '../../types';
import GroupCompetitionsCommand from './group/GroupCompetitions';
import GroupDetailsCommand from './group/GroupDetails';
import GroupGainedCommand from './group/GroupGained';
import GroupHiscoresCommand from './group/GroupHiscores';
import GroupRecordsCommand from './group/GroupRecords';
import PlayerAchievements from './player/PlayerAchievements';
import PlayerActivitiesCommand from './player/PlayerActivities';
import PlayerBossesCommand from './player/PlayerBosses';
import PlayerStatsCommand from './player/PlayerStats';
import PlayerUpdateCommand from './player/UpdatePlayer';

const commands: Command[] = [
  // player commands
  PlayerStatsCommand,
  PlayerBossesCommand,
  PlayerActivitiesCommand,
  PlayerAchievements,
  PlayerUpdateCommand,

  // group commands
  GroupDetailsCommand,
  GroupHiscoresCommand,
  GroupRecordsCommand,
  GroupGainedCommand,
  GroupCompetitionsCommand
];

export default commands;
