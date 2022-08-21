import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import commands from './commands/instances';
import config from './config';

const { guildId, clientId } = config.discord;

export async function deployCommands(): Promise<void> {
  const guildCommands = [];
  const globalCommands = [];

  for (const command of commands) {
    const slashCommand = command.slashCommand;

    if (slashCommand && !command.subcommand) {
      if (command.global && !process.env.DISCORD_DEV_LOCAL) {
        globalCommands.push(slashCommand.toJSON());
      } else {
        // Add a [DEV 🧑‍💻] prefix to easily identify local commands during development
        const modified = slashCommand.setDescription(`[DEV 🧑‍💻]: ${slashCommand.description}`);
        guildCommands.push(modified.toJSON());
      }
    }
  }

  const restClient = new REST({ version: '9' }).setToken(config.token as string);

  if (guildCommands.length > 0) {
    try {
      await restClient.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands });
      console.log(`Successfully registered ${guildCommands.length} guild slash commands.`);
    } catch (e) {
      console.log('Failed to register guild commands', e);
    }
  }

  if (globalCommands.length > 0) {
    try {
      await restClient.put(Routes.applicationCommands(clientId), { body: globalCommands });
      console.log(`Successfully registered ${globalCommands.length} global slash commands.`);
    } catch (e) {
      console.log('Failed to register global commands', e);
    }
  }
}
