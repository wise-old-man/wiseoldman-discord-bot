import { Shard, ShardingManager } from 'discord.js';
import config from './config';
import * as api from './api';
import { join } from 'path';

const manager = new ShardingManager(join(__dirname, 'base'), { token: config.token });

manager.on('shardCreate', (shard: Shard) => console.log(`[SHARD] Launched  shard ${shard.id}`));

manager.spawn();

api.init();
