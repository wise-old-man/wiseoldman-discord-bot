import { Command } from '../../types';
import GroupCompetitionsCommand from './group/competitions';
import GroupDetailsCommand from './group/details';
import GroupGainedCommand from './group/gained';
import GroupHiscoresCommand from './group/hiscores';
import GroupRecordsCommand from './group/records';
import PlayerActivitiesCommand from './player/activities';
import PlayerBossesCommand from './player/bosses';
import PlayerStatsCommand from './player/stats';
import PlayerUpdateCommand from './player/update';

const commands: Command[] = [
  // player commands
  PlayerStatsCommand,
  PlayerBossesCommand,
  PlayerActivitiesCommand,
  PlayerUpdateCommand,

  // group commands
  GroupDetailsCommand,
  GroupHiscoresCommand,
  GroupRecordsCommand,
  GroupGainedCommand,
  GroupCompetitionsCommand
];

export default commands;
