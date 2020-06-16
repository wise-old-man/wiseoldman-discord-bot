import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class Server extends Model<Server> {
  @PrimaryKey
  @Column
  guildId!: string;

  @Column
  groupId!: number;

  @Default(() => '!')
  @Column
  prefix!: string;
}
