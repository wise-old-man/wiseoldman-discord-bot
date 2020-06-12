import { Command } from '../../types';
import BossesCommand from './bosses';
import StatsCommand from './stats';
import UpdateCommand from './update';

const commands: Command[] = [StatsCommand, BossesCommand, UpdateCommand];

export default commands;
