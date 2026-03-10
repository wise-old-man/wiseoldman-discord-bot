import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { CompetitionResponse, GroupResponse } from '@wise-old-man/utils';
import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import config from '../../config';
import { createModerationButtons, ModerationType } from '../../utils/buttonInteractions';
import { Event } from '../../utils/events';

const SAMPLES_AMOUNT = 5;

interface DataType {
  creatorIpHash: string;
  groups: Array<{
    group: GroupResponse;
    issue: {
      type: string;
      reason?: string;
    };
  }>;
  competitions: Array<{
    competition: CompetitionResponse;
    issue: {
      type: string;
      reason?: string;
    };
  }>;
}

class CreationSpamWarning implements Event {
  type: string;

  constructor() {
    this.type = 'CREATION_SPAM_WARNING';
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
    const { creatorIpHash, groups, competitions } = data;

    const actions = createModerationButtons(ModerationType.SPAM, creatorIpHash);

    const lines: string[] = [`Creator IP Hash: \`${creatorIpHash}\``];

    if (groups.length > 0) {
      const groupSample = getRandomSample(groups);
      const groupSampleLabel =
        groupSample.length < groups.length ? ` — showing ${groupSample.length} of ${groups.length}` : '';
      lines.push(`\n**Groups (${groups.length}${groupSampleLabel}):**`);
      for (const { group, issue } of groupSample) {
        lines.push(`- [${group.name.slice(0, 50)}](https://wiseoldman.net/groups/${group.id})`);
        if (group.description) lines.push(`  - *${group.description.slice(0, 100)}*`);
        lines.push(`  - [${issue.type}]${issue.reason ? `: ${issue.reason}` : ''}`);
      }
    }

    if (competitions.length > 0) {
      const competitionSample = getRandomSample(competitions);
      const competitionSampleLabel =
        competitionSample.length < competitions.length
          ? ` — showing ${competitionSample.length} of ${competitions.length}`
          : '';
      lines.push(`\n**Competitions (${competitions.length}${competitionSampleLabel}):**`);
      for (const { competition, issue } of competitionSample) {
        lines.push(
          `- [${competition.title.slice(0, 50)}](https://wiseoldman.net/competitions/${competition.id})`
        );
        lines.push(`  - [${issue.type}]${issue.reason ? `: ${issue.reason}` : ''}`);
      }
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`Creation Spam Warning`)
      .setDescription(lines.join('\n'));

    const reviewChannel = client.channels?.cache.get(config.discord.channels.spamReviews);

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

export default new CreationSpamWarning();
