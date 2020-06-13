import { Command } from '../../types';
import GroupCompetitionsCommand from './group/competitions';
import GroupInfoCommand from './group/info';
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
  GroupInfoCommand,
  GroupCompetitionsCommand
];

export default commands;
