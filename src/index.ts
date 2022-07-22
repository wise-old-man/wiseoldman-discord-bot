import { Shard, ShardingManager } from 'discord.js';
import config from './config';
import * as api from './api';

const manager = new ShardingManager('dist/base.js', { token: config.token });

manager.on('shardCreate', (shard: Shard) => console.log(`[SHARD] Launched  shard ${shard.id}`));

manager.spawn();

api.init();
