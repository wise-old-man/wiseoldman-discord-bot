import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand } from '../../../types';
import CommandError from '../../CommandError';
import { onError } from '../../router';

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
    groupCommands.forEach(async c => {
      if (c.slashCommand?.name !== subcommand) return;
      try {
        await c.execute(message);
      } catch (e) {
        // If a command error was thrown during execution, handle the response here.
        if (e instanceof CommandError) {
          return onError({ interaction: message, title: e.message, tip: e.tip });
        }
      }
    });
  }
}

export default new Group();
