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
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../services/wiseoldman';
import config from '../../../config';
import { bold, Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'records',
  description: "View a group's records.",
  options: [
    {
      type: 'string',
      name: 'metric',
      description: 'The metric to show records for.',
      autocomplete: true,
      required: true
    },
    {
      type: 'string',
      name: 'period',
      description: 'The period to show records for.',
      required: true,
      choices: PERIODS.map(p => ({ value: p, label: PeriodProps[p].name }))
    }
  ]
};

class GroupRecordsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
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

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} records (${period})`)
      .setDescription(recordsList)
      .setURL(`https://wiseoldman.net/groups/${groupId}/records/`)
      .setFooter({ text: `Tip: Try /group records metric: zulrah period: day` });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupRecordsCommand();
