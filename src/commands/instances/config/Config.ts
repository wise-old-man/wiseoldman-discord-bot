import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand } from '../../../types';
import { executeSubCommand } from '../../router';

import ConfigChannel from './ConfigChannel';
import ConfigGroup from './ConfigGroup';

const configCommands: SubCommand[] = [ConfigChannel, ConfigGroup];

class Config implements Command {
  requiresAdmin: boolean;
  slashCommand?: SlashCommandBuilder;
  global?: boolean | undefined;

  constructor() {
    this.requiresAdmin = true;
    this.slashCommand = new SlashCommandBuilder()
      .setName('config')
      .setDescription('Configure various things');
    configCommands.forEach(configCommand => {
      if (configCommand.slashCommand) {
        this.slashCommand?.addSubcommand(configCommand.slashCommand);
      }
    });
    this.global = true;
  }

  async execute(message: CommandInteraction) {
    const subcommand = message.options.getSubcommand();
    await executeSubCommand(message, subcommand, configCommands);
  }
}

export default new Config();
