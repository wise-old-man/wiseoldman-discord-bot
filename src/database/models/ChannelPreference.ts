import { Column, Model, DataType, Table } from 'sequelize-typescript';

@Table({ tableName: 'channelPreferences' })
export class ChannelPreference extends Model<ChannelPreference> {
  @Column({ type: DataType.STRING(256), primaryKey: true, allowNull: false })
  guildId!: string;

  @Column({ type: DataType.STRING(64), primaryKey: true, allowNull: false })
  type!: string;

  @Column({ type: DataType.STRING(256), allowNull: true })
  channelId!: string;

  async setChannelId(channelId: string): Promise<ChannelPreference> {
    return await this.update({ channelId });
  }
}
