import Discord from 'discord.js';
import * as bot from './bot';
import config from './config';

const client = new Discord.Client();

client.once('ready', () => bot.init(client));
client.login(config.token);
