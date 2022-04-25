import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand } from '../../../types';
import { executeSubCommand } from '../../router';

import GroupCompetition from './GroupCompetition';
import GroupCompetitions from './GroupCompetitions';
import GroupDetails from './GroupDetails';
import GroupGained from './GroupGained';
import GroupHiscores from './GroupHiscores';
import GroupMembers from './GroupMembers';
import GroupRecords from './GroupRecords';

const groupCommands: SubCommand[] = [
  GroupCompetition,
  GroupCompetitions,
  GroupDetails,
  GroupGained,
  GroupHiscores,
  GroupMembers,
  GroupRecords
];

class Group implements Command {
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandsOnlyBuilder;
  global?: boolean | undefined;

  constructor() {
    this.requiresGroup = true;
    this.slashCommand = new SlashCommandBuilder()
      .setName('group')
      .setDescription('View information about a group');
    groupCommands.forEach(groupCommand => {
      if (groupCommand.slashCommand) {
        this.slashCommand?.addSubcommand(groupCommand.slashCommand);
      }
    });

    this.global = true;
  }

  async execute(message: CommandInteraction) {
    const subcommand = message.options.getSubcommand();
    await executeSubCommand(message, subcommand, groupCommands);
  }
}

export default new Group();
