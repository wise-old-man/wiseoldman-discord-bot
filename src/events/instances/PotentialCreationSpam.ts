import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Event } from '../../utils/events';
import { Competition, Group } from '@wise-old-man/utils';
import config from '../../config';
import { createModerationButtons, ModerationType } from '../../utils/buttonInteractions';

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

  async execute(data: DataType, client: Client) {
    const { ipHash, groups, competitions } = data;

    const actions = createModerationButtons(ModerationType.SPAM, ipHash);

    let description = `ipHash: ${ipHash}\nGroups created: ${groups.length}\nCompetitions created: ${competitions.length}\n\nSample:`;

    for (const group of getRandomSample(groups)) {
      description += `\n[${group.id}](https://wiseoldman.net/groups/${group.id}): ${group.name.slice(
        0,
        50
      )}`;
    }

    for (const competition of getRandomSample(competitions)) {
      description += `\n[${competition.id}](https://wiseoldman.net/competitions/${
        competition.id
      }): ${competition.title.slice(0, 50)}`;
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`Potential Spam Detected`)
      .setDescription(description);

    const reviewChannel = client.channels?.cache.get(config.discord.channels.potentialSpamReviews);
    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel))
      return;

    await reviewChannel.send({
      embeds: [message],
      components: [actions]
    });
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
