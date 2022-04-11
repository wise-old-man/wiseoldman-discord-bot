import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import commands from './commands/instances';
import config from './config';

const globalCommands = [];
const guildCommands = [];

for (const command of commands) {
  const slashCommand = command.slashCommand;
  if (slashCommand && !command.subcommand) {
    if (command.global) {
      globalCommands.push(slashCommand.toJSON());
    } else {
      guildCommands.push(slashCommand.toJSON());
    }
  }
}

const rest = new REST({ version: '9' }).setToken(config.token as string);

if (guildCommands.length > 0) {
  try {
    rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), {
      body: guildCommands
    });
    console.log(`Successfully registered ${guildCommands.length} guild slash commands.`);
  } catch (e) {
    console.log(e);
  }
}

if (globalCommands.length > 0) {
  try {
    rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: globalCommands
    });
    console.log(`Successfully registered ${globalCommands.length} global slash commands.`);
  } catch (e) {
    console.log(e);
  }
}
