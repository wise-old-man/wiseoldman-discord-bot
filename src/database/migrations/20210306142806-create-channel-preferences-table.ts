/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('channelPreferences', {
    guildId: {
      type: dataTypes.STRING(256),
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: dataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    channelId: {
      type: dataTypes.STRING(256)
    },
    createdAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false
    }
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.dropTable('channelPreferences');
}

export { up, down };
