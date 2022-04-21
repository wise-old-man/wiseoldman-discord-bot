import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command, SubCommand, ParsedMessage } from '../../../types';
import CommandError from '../../CommandError';
import { onError } from '../../router';

import ConfigChannel from './ConfigChannel';
import ConfigGroup from './ConfigGroup';

const configCommands: SubCommand[] = [ConfigChannel, ConfigGroup];

class Config implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;
  slashCommand?: SlashCommandSubcommandsOnlyBuilder;
  global?: boolean | undefined;

  constructor() {
    this.name = 'Configure various things';
    this.template = '/config';
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

  activated(message: ParsedMessage) {
    return message.command === 'group';
  }

  async execute(message: CommandInteraction) {
    const subcommand = message.options.getSubcommand();
    configCommands.forEach(async c => {
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

export default new Config();
