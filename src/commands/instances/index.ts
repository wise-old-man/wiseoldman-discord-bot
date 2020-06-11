import { Command } from '../../types';
import StatsCommand from './stats';
import UpdateCommand from './update';

const commands: Command[] = [StatsCommand, UpdateCommand];

export default commands;
