import { CommandConfig, AggregateCommand, Command } from '../../../utils';
import GroupCompetitionCommand from './GroupCompetitionCommand';
import GroupCompetitionsCommand from './GroupCompetitionsCommand';
import GroupDetailsCommand from './GroupDetailsCommand';
import GroupMembersCommand from './GroupMembersCommand';
import GroupHiscoresCommand from './GroupHiscoresCommand';
import GroupRecordsCommand from './GroupRecordsCommand';
import GroupGainedCommand from './GroupGainedCommand';

const SUBCOMMANDS: Command[] = [
  GroupGainedCommand,
  GroupMembersCommand,
  GroupDetailsCommand,
  GroupRecordsCommand,
  GroupHiscoresCommand,
  GroupCompetitionCommand,
  GroupCompetitionsCommand
];

const CONFIG: CommandConfig = {
  name: 'group',
  description: 'View information about a group'
};

class GroupRootCommand extends AggregateCommand {
  constructor() {
    super(CONFIG, SUBCOMMANDS);
  }
}

export default new GroupRootCommand();
