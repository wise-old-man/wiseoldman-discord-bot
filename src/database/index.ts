import { Sequelize } from 'sequelize-typescript';
import databaseConfig from './config';
import { Guild } from './models/Guild';

const sequelize = new Sequelize({
  database: databaseConfig.database,
  username: databaseConfig.username,
  password: databaseConfig.password,
  dialect: 'mysql',
  models: [Guild]
});

export { sequelize };
