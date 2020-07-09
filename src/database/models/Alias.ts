import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'aliases' })
export class Alias extends Model<Alias> {
  @PrimaryKey
  @Column
  userId!: string;

  @Column
  username!: string;

  async setUsername(username: string): Promise<Alias> {
    return await this.update({ username });
  }
}
