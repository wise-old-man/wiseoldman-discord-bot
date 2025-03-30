import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import config from '../../config';
import { Event } from '../../utils/events';

type DataType = {
    id: number,
    name: string,
    type: string,
}[]

class OffensiveNamesFound implements Event {
  type: string;

  constructor() {
    this.type = 'OFFENSIVE_NAMES_FOUND';
  }

  async execute(data: DataType, client: Client) {

    const description = data.map(a => `Name: ${a.name} | Type: ${a.type} | ID: ${a.id}`).join("\n")

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`Offensive/spam names found.`)
      .setDescription(description);

    const reviewChannel = client.channels?.cache.get(config.discord.channels.potentialSpamReviews);
    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel))
      return;

    await reviewChannel.send({
      embeds: [message],
    });
  }
}

export default new OffensiveNamesFound();
