import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandBuilder
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getServer, getUsername } from '~/services/prisma';

export class CommandError extends Error {
  tip?: string;

  constructor(message: string, tip?: string) {
    super(message);
    this.name = 'CommandError';
    if (tip) this.tip = tip;
  }
}

export interface BaseCommand {
  private?: boolean;
  requiresAdmin?: boolean;
  slashCommand: SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export class Command implements BaseCommand {
  private?: boolean;
  requiresAdmin?: boolean;
  slashCommand: SlashCommandSubcommandBuilder;

  constructor(config: CommandConfig) {
    const command = new SlashCommandSubcommandBuilder()
      .setName(config.name)
      .setDescription(config.description);

    if (config.options) {
      attachOptions(command, config);
    }

    this.slashCommand = command;
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    throw new Error(`Command not implemented - ${interaction.commandName}`);
  }
}

export class AggregateCommand implements BaseCommand {
  private?: boolean;
  requiresAdmin?: boolean;
  slashCommand: SlashCommandSubcommandsOnlyBuilder;
  subCommands: Command[];

  constructor(config: CommandConfig, subCommands: Command[]) {
    const command = new SlashCommandBuilder().setName(config.name).setDescription(config.description);

    if (config.options) {
      attachOptions(command, config);
    }

    this.slashCommand = command;
    this.subCommands = subCommands;

    subCommands.forEach(cmd => {
      this.slashCommand.addSubcommand(cmd.slashCommand);
    });
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const targetSubCommand = this.subCommands.find(
      s => s.slashCommand.name === interaction.options.getSubcommand()
    );

    if (!targetSubCommand) {
      console.log('Error: Sub Command not implemented', interaction.options.getSubcommand());
      return;
    }

    await targetSubCommand.execute(interaction);
  }
}

interface BaseOption {
  type: 'integer' | 'string' | 'channel' | 'user';
  name: string;
  description: string;
  required?: boolean;
  autocomplete?: boolean;
}

interface IntegerOption extends BaseOption {
  type: 'integer';
  choices?: Array<{ value: number; label: string }>;
}

interface StringOption extends BaseOption {
  type: 'string';
  choices?: Array<{ value: string; label: string }>;
}

interface ChannelOption extends BaseOption {
  type: 'channel';
  channelType: number;
}

interface UserOption extends BaseOption {
  type: 'user';
}

export interface CommandConfig {
  name: string;
  description: string;
  options?: Array<IntegerOption | StringOption | ChannelOption | UserOption>;
}

function attachOptions(
  command: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  config: CommandConfig
) {
  config.options.forEach(option => {
    if (option.type === 'integer') {
      command.addIntegerOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);

        if (option.choices && option.choices.length > 0) {
          opt.addChoices(option.choices.map(c => [c.label, c.value]));
        }

        return opt;
      });
    } else if (option.type === 'string') {
      command.addStringOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.autocomplete) opt.setAutocomplete(true);
        if (option.required) opt.setRequired(true);

        if (option.choices && option.choices.length > 0) {
          opt.addChoices(option.choices.map(c => [c.label, c.value]));
        }

        return opt;
      });
    } else if (option.type === 'channel') {
      command.addChannelOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);
        if (option.channelType) opt.addChannelType(option.channelType);

        return opt;
      });
    } else if (option.type === 'user') {
      command.addUserOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);

        return opt;
      });
    }
  });
}

export async function getUsernameParam(interaction: CommandInteraction) {
  const username = interaction.options.getString('username', false);
  if (username) return username;

  const inferredUsername = await getUsername(interaction.user.id);

  if (!inferredUsername) {
    throw new CommandError(
      'This commands requires a username. Specify one in the command, or set a default by using the `/setrsn` command.'
    );
  }

  return inferredUsername;
}

export async function getLinkedGroupId(interaction: CommandInteraction) {
  if (!interaction.inGuild()) {
    throw new CommandError('This command can only be used in a Discord server.');
  }

  const guildId = interaction.guildId;

  if (!guildId) {
    throw new CommandError("Couldn't find the origin server for this interaction.");
  }

  const server = await getServer(guildId);
  const groupId = server?.groupId || -1;

  if (groupId === -1) {
    throw new CommandError(
      'There is no group configured for this Discord server.',
      'Start the group setup with the "/config group" command.'
    );
  }

  return groupId;
}
