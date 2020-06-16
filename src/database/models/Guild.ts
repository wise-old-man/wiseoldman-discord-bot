import { Column, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class Guild extends Model<Guild> {
  @PrimaryKey
  @Column
  id!: string;

  @Column
  groupId!: number;

  @Default(() => '!')
  @Column
  prefix!: string;
}
