import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandBuilder,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  ApplicationCommandOptionAllowedChannelTypes
} from 'discord.js';
import { getServer, getUsername } from '../services/prisma';

const DISCORD_TAG_REGEX = /<@!?(\d+)>/;

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
  moderation?: boolean;
  requiresAdmin?: boolean;
  slashCommand: SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export class Command implements BaseCommand {
  private?: boolean;
  moderation?: boolean;
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

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    throw new Error(`Command not implemented - ${interaction.commandName}`);
  }
}

export class AggregateCommand implements BaseCommand {
  private?: boolean;
  moderation?: boolean;
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

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
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
  type:
    | ApplicationCommandOptionType.Integer
    | ApplicationCommandOptionType.String
    | ApplicationCommandOptionType.Channel
    | ApplicationCommandOptionType.User
    | ApplicationCommandOptionType.Boolean;
  name: string;
  description: string;
  required?: boolean;
  autocomplete?: boolean;
}

interface IntegerOption extends BaseOption {
  type: ApplicationCommandOptionType.Integer;
  choices?: Array<{ name: string; value: number }>;
}

interface BooleanOption extends BaseOption {
  type: ApplicationCommandOptionType.Boolean;
}

interface StringOption extends BaseOption {
  type: ApplicationCommandOptionType.String;
  choices?: Array<{ name: string; value: string }>;
}

interface ChannelOption extends BaseOption {
  type: ApplicationCommandOptionType.Channel;
  channelType?: ApplicationCommandOptionAllowedChannelTypes;
}

interface UserOption extends BaseOption {
  type: ApplicationCommandOptionType.User;
}

export interface CommandConfig {
  name: string;
  description: string;
  options?: Array<IntegerOption | StringOption | BooleanOption | ChannelOption | UserOption>;
}

function attachOptions(
  command: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  config: CommandConfig
) {
  config.options?.forEach(option => {
    if (option.type === ApplicationCommandOptionType.Integer) {
      command.addIntegerOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);

        if (option.choices && option.choices.length > 0) {
          for (const c of option.choices) {
            opt.addChoices({ name: c.name, value: c.value });
          }
        }

        return opt;
      });
    } else if (option.type === ApplicationCommandOptionType.String) {
      command.addStringOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.autocomplete) opt.setAutocomplete(true);
        if (option.required) opt.setRequired(true);

        if (option.choices && option.choices.length > 0) {
          for (const c of option.choices) {
            opt.addChoices({ name: c.name, value: c.value });
          }
        }

        return opt;
      });
    } else if (option.type === ApplicationCommandOptionType.Channel) {
      command.addChannelOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);
        if (option.channelType) opt.addChannelTypes(option.channelType);

        return opt;
      });
    } else if (option.type === ApplicationCommandOptionType.User) {
      command.addUserOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);

        return opt;
      });
    } else if (option.type === ApplicationCommandOptionType.Boolean) {
      command.addBooleanOption(opt => {
        opt.setName(option.name).setDescription(option.description);

        if (option.required) opt.setRequired(true);
        return opt;
      });
    }
  });
}

export async function getUsernameParam(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString('username', false);
  const isDiscordId = username?.match(DISCORD_TAG_REGEX);

  if (username !== null && !isDiscordId) return username;

  // if it's a discord id, replace the <@> and pass as the alias id
  const inferredUsername = await getUsername(
    isDiscordId && username !== null ? username.replace(/[^0-9]/g, '') : interaction.user.id
  );

  if (!inferredUsername) {
    throw new CommandError(
      'This commands requires a username. Specify one in the command, or set a default by using the `/setrsn` command.'
    );
  }

  return inferredUsername;
}

export async function getLinkedGroupId(interaction: ChatInputCommandInteraction) {
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

export function requiresAdminPermissions(command: BaseCommand, subCommandName: string | null): boolean {
  if (!(command instanceof AggregateCommand)) {
    return !!command.requiresAdmin;
  }

  return (
    !!subCommandName &&
    !!command.subCommands.find(s => s.slashCommand.name === subCommandName)?.requiresAdmin
  );
}
