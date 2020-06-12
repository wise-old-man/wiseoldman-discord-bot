import { Command } from '../../types';
import ActivitiesCommand from './activities';
import BossesCommand from './bosses';
import StatsCommand from './stats';
import UpdateCommand from './update';

const commands: Command[] = [StatsCommand, BossesCommand, ActivitiesCommand, UpdateCommand];

export default commands;
