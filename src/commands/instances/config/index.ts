import { CommandConfig, AggregateCommand, Command } from '../../../utils';
import ConfigGroupCommand from './ConfigGroupCommand';
import ConfigNotificationsCommand from './ConfigNotificationsCommand';

const SUBCOMMANDS: Command[] = [ConfigGroupCommand, ConfigNotificationsCommand];

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
