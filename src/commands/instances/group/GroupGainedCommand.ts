import {
  formatNumber,
  getMetricName,
  isMetric,
  isPeriod,
  Metric,
  parseMetricAbbreviation,
  Period
} from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../services/wiseoldman';
import config from '../../../config';
import { getEmoji } from '../../../utils';
import { CommandConfig, Command } from '../../utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';
import { bold, getLinkedGroupId } from '../../../utils/wooow';

const CONFIG: CommandConfig = {
  name: 'gained',
  description: "View the group's gains leaderboards.",
  options: [
    {
      type: 'string',
      name: 'metric',
      description: 'The metric to show gains for',
      required: true,
      autocomplete: true
    },
    {
      type: 'string',
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

  async execute(interaction: CommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const periodParam = interaction.options.getString('period', true);
    const metricParam = parseMetricAbbreviation(interaction.options.getString('metric', true));

    const period = isPeriod(periodParam) ? periodParam : Period.WEEK;
    const metric = isMetric(metricParam) ? metricParam : Metric.OVERALL;

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError(ErrorCode.GROUP_NOT_FOUND);
    });

    const gained = await womClient.groups.getGroupGains(groupId, { period, metric });

    const gainedList = gained
      .map((g, i) => `${i + 1}. ${bold(g.player.displayName)} - ${formatNumber(g.gained, true)}`)
      .join('\n');

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/gained/`)
      .setFooter({ text: `Tip: Try /group gained metric: zulrah period: day` })
      .setDescription(gainedList);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupGainedCommand();
