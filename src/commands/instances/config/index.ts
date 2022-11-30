import { CommandConfig, AggregateCommand, Command } from '../../utils/commands';
import ConfigGroupCommand from './ConfigGroupCommand';

const SUBCOMMANDS: Command[] = [ConfigGroupCommand];

const CONFIG: CommandConfig = {
  name: 'config',
  description: 'Configure the bot for your server.'
};

class ConfigRootCommand extends AggregateCommand {
  constructor() {
    super(CONFIG, SUBCOMMANDS);
    this.private = false;
  }
}

export default new ConfigRootCommand();
