import { Client, Guild, Intents, Interaction, MessageEmbed, TextChannel } from 'discord.js';
import config from './config';
import * as router from './commands/router';
import {
  PATREON_LEAGUE_MODAL_ID,
  PATREON_LEAGUE_TRIGGER_ID,
  PATREON_MODAL_ID,
  PATREON_TRIGGER_ID,
  handlePatreonLeagueModalSubmit,
  handlePatreonLeagueTrigger,
  handlePatreonModalSubmit,
  handlePatreonTrigger,
  setupPatreonTrigger
} from './patreon-trigger';

class Bot {
  client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
      ],
      shards: 'auto'
    });
  }

  async init() {
    console.log('Starting bot...');

    this.client.once('ready', () => {
      // Init bot properties
      this.client.user?.setActivity('bot.wiseoldman.net');

      // Send received interaction to the command router
      this.client.on('interactionCreate', (interaction: Interaction) => {
        if (interaction.isButton() && interaction.customId === PATREON_TRIGGER_ID) {
          handlePatreonTrigger(interaction);
          return;
        }

        if (interaction.isButton() && interaction.customId === PATREON_LEAGUE_TRIGGER_ID) {
          handlePatreonLeagueTrigger(interaction);
          return;
        }

        if (interaction.isModalSubmit() && interaction.customId === PATREON_MODAL_ID) {
          handlePatreonModalSubmit(interaction);
          return;
        }

        console.log('1');
        if (interaction.isModalSubmit() && interaction.customId === PATREON_LEAGUE_MODAL_ID) {
          console.log('2');
          handlePatreonLeagueModalSubmit(interaction);
          return;
        }

        router.onInteractionReceived(interaction);
      });

      this.client.on('guildCreate', guild => {
        const openChannel = findOpenChannel(guild);
        if (openChannel) openChannel.send({ embeds: [buildJoinMessage()] });
      });

      setupPatreonTrigger(this.client);

      console.log('Bot is running.');
    });

    await this.client.login(config.token);

    return this.client;
  }
}

function buildJoinMessage() {
  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setTitle(`❤️ Thanks for adding me!`)
    .setDescription(
      "You can now start using the Wise Old Man bot, but there's some quick configurations required if you want to take full advantage of all the features.\nCheck the bot website below, in it you will find the configuration commands."
    )
    .setURL('https://bot.wiseoldman.net')
    .addFields([
      {
        name: 'Bot Website',
        value: 'https://bot.wiseoldman.net'
      },
      {
        name: 'Main Website',
        value: 'https://wiseoldman.net'
      }
    ]);
}

/**
 * Finds the first text channel where the bot has permissions to send messages to.
 */
function findOpenChannel(guild: Guild) {
  const channel = guild.channels.cache.find(c => {
    return c.type === 'GUILD_TEXT' && Boolean(guild.me?.permissions.has('SEND_MESSAGES'));
  });

  return channel as TextChannel;
}

export default new Bot();
