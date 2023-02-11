import { CommandConfig, AggregateCommand, Command } from '../../../utils';
import ConfigChannelCommand from './ConfigChannelCommand';
import ConfigGroupCommand from './ConfigGroupCommand';

const SUBCOMMANDS: Command[] = [ConfigGroupCommand, ConfigChannelCommand];

const CONFIG: CommandConfig = {
  name: 'config',
  description: 'Configure the bot for your server.'
};

class ConfigRootCommand extends AggregateCommand {
  constructor() {
    super(CONFIG, SUBCOMMANDS);
  }
}

export default new ConfigRootCommand();
