import {
  formatNumber,
  isMetric,
  Metric,
  MetricProps,
  parsePeriodExpression,
  PeriodProps
} from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient, { parseMetricAbbreviation } from '../../../services/wiseoldman';
import { bold, Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '../../../utils';
import { createPaginatedEmbed, RESULTS_PER_PAGE } from '../../pagination';

const CONFIG: CommandConfig = {
  name: 'gained',
  description: "View the group's gains leaderboards.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'metric',
      description: 'The metric to show gains for',
      required: true,
      autocomplete: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'period',
      description: 'You can use custom periods with this format: 1y6d5h',
      required: true,
      autocomplete: true
    }
  ]
};

class GroupGainedCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const period = interaction.options.getString('period', true);
    const metricParam = parseMetricAbbreviation(interaction.options.getString('metric', true));

    const metric = metricParam !== null && isMetric(metricParam) ? metricParam : Metric.OVERALL;

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    const gained = await womClient.groups.getGroupGains(groupId, { period, metric }).catch(e => {
      throw new CommandError(`${e.message}`);
    });

    const pageCount = Math.min(25, Math.ceil(gained.length / RESULTS_PER_PAGE));

    const urlPeriod =
      period in PeriodProps
        ? `period=${period}`
        : `startDate=${new Date(
            Date.now() - parsePeriodExpression(period)!.durationMs
          ).toISOString()}&endDate=${new Date().toISOString()}`;

    const embedTemplate = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${MetricProps[metric].name} gains (${period})`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/gained?${urlPeriod}&metric=${metric}`);

    const paginatedMessage = createPaginatedEmbed(embedTemplate, 120_000);

    for (let i = 0; i < pageCount; i++) {
      const gainedList = gained
        .slice(i * RESULTS_PER_PAGE, i * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
        .map(
          (g, idx) =>
            `${i * RESULTS_PER_PAGE + idx + 1}. ${bold(g.player.displayName)} - ${formatNumber(g.data.gained, true)}`
        )
        .join('\n');

      paginatedMessage.addPageEmbed(new EmbedBuilder().setDescription(gainedList));
    }

    paginatedMessage.run(interaction);
  }
}

export default new GroupGainedCommand();
