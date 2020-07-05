import { Sequelize } from 'sequelize-typescript';
import databaseConfig from './config';
import { Server } from './models/Server';

const sequelize = new Sequelize({
  ...databaseConfig,
  dialect: 'postgres',
  models: [Server]
});

export { sequelize, Server };
