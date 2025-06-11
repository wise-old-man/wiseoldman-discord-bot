import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
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

  async execute(
    data: DataType,
    client: Client
  ): AsyncResult<
    true,
    | { code: 'CHANNEL_NOT_FOUND' }
    | { code: 'CHANNEL_INVALID_TYPE' }
    | { code: 'FAILED_TO_SEND_REVIEW_MESSAGE' }
  > {
    const embeds = data.map(buildEmbed);

    const reviewChannel = client.channels?.cache.get(config.discord.channels.potentialSpamReviews);

    if (!reviewChannel) {
      return errored({
        code: 'CHANNEL_NOT_FOUND'
      });
    }

    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel)) {
      return errored({
        code: 'CHANNEL_INVALID_TYPE'
      });
    }

    const sendResult = await fromPromise(
      reviewChannel.send({
        embeds
      })
    );

    if (isErrored(sendResult)) {
      return errored({
        code: 'FAILED_TO_SEND_REVIEW_MESSAGE'
      });
    }

    return complete(true);
  }
}

function buildEmbed(entity: DataType[number]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(config.visuals.blue)
    .setTitle(`Offensive/spam ${entity.type} found.`)
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
