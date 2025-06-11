import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { Competition, Group } from '@wise-old-man/utils';
import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import config from '../../config';
import { createModerationButtons, ModerationType } from '../../utils/buttonInteractions';
import { Event } from '../../utils/events';

interface DataType {
  ipHash: string;
  groups: Group[];
  competitions: Competition[];
}

const SAMPLES_AMOUNT = 5;

class HiddenGroupCreated implements Event {
  type: string;

  constructor() {
    this.type = 'POTENTIAL_CREATION_SPAM';
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
    const { ipHash, groups, competitions } = data;

    const actions = createModerationButtons(ModerationType.SPAM, ipHash);

    let description = `ipHash: ${ipHash}\nGroups created: ${groups.length}\nCompetitions created: ${competitions.length}\n\nSample:`;

    for (const group of getRandomSample(groups)) {
      const url = `https://wiseoldman.net/groups/${group.id}`;
      description += `\n[${group.id}](${url}): ${group.name.slice(0, 50)}`;
    }

    for (const competition of getRandomSample(competitions)) {
      const url = `https://wiseoldman.net/competitions/${competition.id}`;
      description += `\n[${competition.id}](${url}): ${competition.title.slice(0, 50)}`;
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`Potential Spam Detected`)
      .setDescription(description);

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
        embeds: [message],
        components: [actions]
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

function getRandomSample<T>(list: T[]): T[] {
  if (list.length <= SAMPLES_AMOUNT) {
    return list;
  }

  const sample: T[] = [];
  const sampleSet = new Set<number>();

  while (sample.length < SAMPLES_AMOUNT) {
    const rand = Math.floor(Math.random() * list.length);

    if (!sampleSet.has(rand)) {
      sampleSet.add(rand);
      sample.push(list[rand]);
    }
  }

  return sample;
}

export default new HiddenGroupCreated();
