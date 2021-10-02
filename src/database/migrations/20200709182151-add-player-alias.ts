/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('aliases', {
    userId: {
      type: dataTypes.STRING(256),
      primaryKey: true
    },
    username: {
      type: dataTypes.STRING(20),
      allowNull: false
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
  return queryInterface.dropTable('aliases');
}

export { up, down };
