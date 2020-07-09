import { Sequelize } from 'sequelize-typescript';
import databaseConfig from './config';
import { Alias } from './models/Alias';
import { Server } from './models/Server';

const sequelize = new Sequelize({
  ...databaseConfig,
  dialect: 'postgres',
  models: [Server, Alias]
});

export { sequelize, Server, Alias };
