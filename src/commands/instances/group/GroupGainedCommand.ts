import {
  formatNumber,
  getMetricName,
  isMetric,
  Metric,
  parseMetricAbbreviation,
  parsePeriodExpression,
  PeriodProps
} from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import womClient from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId, bold } from '../../../utils';

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

    const gained = await womClient.groups.getGroupGains(groupId, { period, metric });

    const gainedList = gained
      .map((g, i) => `${i + 1}. ${bold(g.player.displayName)} - ${formatNumber(g.data.gained, true)}`)
      .join('\n');

    const urlPeriod =
      period in PeriodProps
        ? `period=${period}`
        : `startDate=${new Date(
            Date.now() - parsePeriodExpression(period).durationMs
          ).toISOString()}&endDate=${new Date().toISOString()}`;

    const response = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/gained?${urlPeriod}&metric=${metric}`)
      .setFooter({ text: `Tip: Try /group gained metric: zulrah period: day` })
      .setDescription(gainedList);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupGainedCommand();
