import { Sequelize } from 'sequelize-typescript';
import databaseConfig from './config';
import { Alias } from './models/Alias';
import { Server } from './models/Server';
import { ChannelPreference } from './models/ChannelPreference';

const sequelize = new Sequelize({
  ...databaseConfig,
  dialect: 'postgres',
  models: [Server, Alias, ChannelPreference]
});

export { sequelize, Server, Alias, ChannelPreference };
