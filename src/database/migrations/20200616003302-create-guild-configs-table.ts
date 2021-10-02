/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('servers', {
    guildId: {
      type: dataTypes.STRING(256),
      primaryKey: true
    },
    groupId: {
      type: dataTypes.INTEGER
    },
    botChannelId: {
      type: dataTypes.STRING(256)
    },
    prefix: {
      type: dataTypes.STRING(20),
      allowNull: false,
      defaultValue: '!'
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

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('servers');
}

export { up, down };
