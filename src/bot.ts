import {
  Client,
  Guild,
  Interaction,
  EmbedBuilder,
  TextChannel,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';
import config from './config';
import * as router from './commands/router';
import {
  PATREON_MODAL_ID,
  PATREON_TRIGGER_ID,
  handlePatreonModalSubmit,
  handlePatreonTrigger,
  setupPatreonTrigger
} from './patreon-trigger';

class Bot {
  client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageTyping
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

        if (interaction.isModalSubmit() && interaction.customId === PATREON_MODAL_ID) {
          handlePatreonModalSubmit(interaction);
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
  return new EmbedBuilder()
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
    return (
      c.type === ChannelType.GuildText &&
      Boolean(guild.members.me?.permissions.has(PermissionFlagsBits.SendMessages))
    );
  });

  return channel as TextChannel;
}

export default new Bot();
