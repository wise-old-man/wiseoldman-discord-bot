import { Sequelize } from 'sequelize-typescript';
import databaseConfig from './config';
import { Server } from './models/Server';

const sequelize = new Sequelize({
  database: databaseConfig.database,
  username: databaseConfig.username,
  password: databaseConfig.password,
  dialect: 'mysql',
  models: [Server]
});

export { sequelize };
