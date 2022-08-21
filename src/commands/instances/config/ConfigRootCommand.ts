import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand } from '../../../types';
import { executeSubCommand } from '../../router';

import ConfigChannelCommand from './ConfigChannelCommand';
import ConfigGroupCommand from './ConfigGroupCommand';

const configCommands: SubCommand[] = [ConfigChannelCommand, ConfigGroupCommand];

class ConfigRootCommand implements Command {
  global?: boolean;
  requiresAdmin: boolean;
  slashCommand?: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.requiresAdmin = true;

    this.slashCommand = new SlashCommandBuilder()
      .setName('config')
      .setDescription('Configure various things');

    configCommands.forEach(configCommand => {
      if (configCommand.slashCommand) {
        this.slashCommand?.addSubcommand(configCommand.slashCommand);
      }
    });
  }

  async execute(message: CommandInteraction) {
    const subcommand = message.options.getSubcommand();
    await executeSubCommand(message, subcommand, configCommands);
  }
}

export default new ConfigRootCommand();
