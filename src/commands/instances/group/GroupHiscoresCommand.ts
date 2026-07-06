import { formatNumber, GroupHiscoresEntryResponse, Metric, MetricProps } from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient, { parseMetricAbbreviation } from '../../../services/wiseoldman';
import { bold, Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '../../../utils';
import { createPaginatedEmbed, RESULTS_PER_PAGE } from '../../pagination';

const CONFIG: CommandConfig = {
  name: 'hiscores',
  description: "View a group's hiscores.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'metric',
      description: 'The metric to show hiscores for.',
      autocomplete: true,
      required: true
    }
  ]
};

class GroupHiscoresCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const metric =
      parseMetricAbbreviation(interaction.options.getString('metric', true)) || Metric.OVERALL;

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    const hiscores = await womClient.groups.getGroupHiscores(groupId, metric);

    const pageCount = Math.min(25, Math.ceil(hiscores.length / RESULTS_PER_PAGE));

    const embedTemplate = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${MetricProps[metric].name} hiscores`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/hiscores?metric=${metric}`);

    const paginatedMessage = createPaginatedEmbed(embedTemplate, 120_000);

    for (let i = 0; i < pageCount; i++) {
      const hiscoresList = hiscores
        .slice(i * RESULTS_PER_PAGE, i * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
        .map(
          (g, idx) => `${i * RESULTS_PER_PAGE + idx + 1}. ${bold(g.player.displayName)} - ${getValue(g)}`
        )
        .join('\n');

      paginatedMessage.addPageEmbed(new EmbedBuilder().setDescription(hiscoresList));
    }

    paginatedMessage.run(interaction);
  }
}

function getValue(result: GroupHiscoresEntryResponse): string {
  if ('level' in result.data) {
    return `${result.data.level} (${formatNumber(result.data.experience || 0, true)})`;
  }

  if ('kills' in result.data) {
    return `${formatNumber(result.data.kills || 0, true)}`;
  }

  if ('score' in result.data) {
    return `${formatNumber(result.data.score || 0, true)}`;
  }

  return `${formatNumber(result.data.value || 0, true)}`;
}

export default new GroupHiscoresCommand();
