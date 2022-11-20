import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand } from '../../../types';
import { executeSubCommand } from '../../router';

import GroupCompetitionCommand from './GroupCompetitionCommand';
import GroupCompetitionsCommand from './GroupCompetitionsCommand';
import GroupDetailsCommand from './GroupDetailsCommand';
import GroupGainedCommand from './GroupGainedCommand';
import GroupHiscoresCommand from './GroupHiscoresCommand';
import GroupMembersCommand from './GroupMembersCommand';
import GroupRecordsCommand from './GroupRecordsCommand';

const groupCommands: SubCommand[] = [
  GroupCompetitionCommand,
  GroupCompetitionsCommand,
  GroupDetailsCommand,
  GroupGainedCommand,
  GroupHiscoresCommand,
  GroupMembersCommand,
  GroupRecordsCommand
];

class GroupRootCommand implements Command {
  global?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandsOnlyBuilder;

  constructor() {
    this.global = true;

    this.slashCommand = new SlashCommandBuilder()
      .setName('group')
      .setDescription('View information about a group');

    groupCommands.forEach(groupCommand => {
      if (groupCommand.slashCommand) {
        this.slashCommand?.addSubcommand(groupCommand.slashCommand);
      }
    });
  }

  async execute(message: CommandInteraction) {
    const subcommand = message.options.getSubcommand();
    await executeSubCommand(message, subcommand, groupCommands);
  }
}

export default new GroupRootCommand();
