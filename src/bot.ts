import {
  Client,
  Guild,
  Interaction,
  EmbedBuilder,
  TextChannel,
  GatewayIntentBits,
  ChannelType,
  Options,
  PermissionFlagsBits
} from 'discord.js';
import config from './config';
import * as router from './commands/router';
import { PATREON_MODAL_ID, handlePatreonModalSubmit, setupPatreonTrigger } from './patreon-trigger';
import { handleButtonInteraction } from './utils/buttonInteractions';

const CACHED_ACTIVE_USER_IDS = new Set<string>(config.discord.cache.excludeUsers);
const CACHED_ACTIVE_GUILD_IDS = new Set<string>(config.discord.cache.excludeGuilds);

class Bot {
  client: Client;

  constructor() {
    this.client = new Client({
      shards: 'auto',
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageTyping
      ],
      makeCache: Options.cacheWithLimits({
        // Disable caching for these
        ThreadManager: { maxSize: 0 },
        MessageManager: { maxSize: 0 },
        PresenceManager: { maxSize: 0 },
        VoiceStateManager: { maxSize: 0 },
        GuildInviteManager: { maxSize: 0 },
        GuildStickerManager: { maxSize: 0 },
        ThreadMemberManager: { maxSize: 0 },
        // Keep some cached items
        UserManager: {
          maxSize: 1000,
          keepOverLimit: user => CACHED_ACTIVE_USER_IDS.has(user.id)
        },
        GuildMemberManager: {
          maxSize: 200,
          keepOverLimit: member => CACHED_ACTIVE_USER_IDS.has(member.user.id)
        },
        GuildEmojiManager: {
          maxSize: 1,
          keepOverLimit: i => CACHED_ACTIVE_GUILD_IDS.has(i.guild.id)
        }
      }),
      sweepers: {
        guildMembers: {
          interval: 60 * 60,
          filter: () => member => !CACHED_ACTIVE_USER_IDS.has(member.user.id)
        },
        users: {
          interval: 60 * 60,
          filter: () => user => !CACHED_ACTIVE_USER_IDS.has(user.id)
        }
      }
    });
  }

  async init() {
    console.log('Starting bot...');

    this.client.once('ready', () => {
      // Init bot properties
      this.client.user?.setActivity('bot.wiseoldman.net');

      // Send received interaction to the command router
      this.client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isButton()) {
          handleButtonInteraction(interaction);
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
