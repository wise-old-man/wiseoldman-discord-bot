import {
  formatNumber,
  getMetricName,
  isMetric,
  isPeriod,
  Metric,
  parseMetricAbbreviation,
  Period,
  PeriodProps,
  PERIODS
} from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import womClient from '../../../services/wiseoldman';
import config from '../../../config';
import { bold, Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'records',
  description: "View a group's records.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'metric',
      description: 'The metric to show records for.',
      autocomplete: true,
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'period',
      description: 'The period to show records for.',
      required: true,
      choices: PERIODS.map(p => ({ name: PeriodProps[p].name, value: p }))
    }
  ]
};

class GroupRecordsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const periodParam = interaction.options.getString('period', true);
    const metricParam = parseMetricAbbreviation(interaction.options.getString('metric', true));

    const period = isPeriod(periodParam) ? periodParam : Period.WEEK;
    const metric = metricParam !== null && isMetric(metricParam) ? metricParam : Metric.OVERALL;

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    const records = await womClient.groups.getGroupRecords(groupId, { period, metric });

    const recordsList = records
      .map((g, i) => `${i + 1}. ${bold(g.player.displayName)} - ${formatNumber(g.value, true)}`)
      .join('\n');

    const response = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} records (${period})`)
      .setDescription(recordsList)
      .setURL(`https://wiseoldman.net/groups/${groupId}/records?period=${period}&metric=${metric}`)
      .setFooter({ text: `Tip: Try /group records metric: zulrah period: day` });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupRecordsCommand();
