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

  async setGroup(groupId: number): Promise<Server> {
    return await this.update({ groupId });
  }

  async setPrefix(prefix: string): Promise<Server> {
    return await this.update({ prefix });
  }
}
