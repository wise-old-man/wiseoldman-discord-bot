import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import config from '../../config';
import { Event } from '../../utils/events';

type DataType = {
  id: number;
  type: string;
  name: string;
  description: string;
  reason: string;
}[];

class OffensiveNamesFound implements Event {
  type: string;

  constructor() {
    this.type = 'OFFENSIVE_NAMES_FOUND';
  }

  async execute(data: DataType, client: Client) {
    const embeds = data.map(buildEmbed);

    const reviewChannel = client.channels?.cache.get(config.discord.channels.potentialSpamReviews);
    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel))
      return;

    await reviewChannel.send({
      embeds
    });
  }
}

function buildEmbed(entity: DataType[number]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(config.visuals.blue)
    .setTitle(`Offensive/spam ${entity.type} found.`)
    .setDescription(`Reason: ${entity.reason}`)
    .setURL(
      entity.type === 'group'
        ? `https://wiseoldman.net/groups/${entity.id}`
        : `https://wiseoldman.net/competitions/${entity.id}`
    )
    .addFields([
      {
        name: 'ID',
        value: entity.id.toString(),
        inline: true
      },
      {
        name: 'Name',
        value: entity.name,
        inline: true
      },
      ...(entity.type === 'group'
        ? [
            {
              name: 'Description',
              value: entity.description,
              inline: true
            }
          ]
        : []),
      {
        name: 'Reason',
        value: entity.reason
      }
    ]);

  return embed;
}

export default new OffensiveNamesFound();
