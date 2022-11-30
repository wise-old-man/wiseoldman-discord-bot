import {
  formatNumber,
  getMetricName,
  GroupHiscoresEntry,
  Metric,
  parseMetricAbbreviation
} from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getEmoji } from '../../../utils';
import { CommandConfig, Command } from '../../utils/commands';
import { bold, getLinkedGroupId } from '../../../utils/wooow';

const CONFIG: CommandConfig = {
  name: 'hiscores',
  description: "View a group's hiscores.",
  options: [
    {
      type: 'string',
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

  async execute(interaction: CommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const metric =
      parseMetricAbbreviation(interaction.options.getString('metric', true)) || Metric.OVERALL;

    const group = await womClient.groups.getGroupDetails(groupId);
    const hiscores = await womClient.groups.getGroupHiscores(groupId, metric);

    const hiscoresList = hiscores
      .map((g, i) => `${i + 1}. ${bold(g.player.displayName)} - ${getValue(g)}`)
      .join('\n');

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} hiscores`)
      .setDescription(hiscoresList)
      .setURL(`https://wiseoldman.net/groups/${groupId}/hiscores/`)
      .setFooter({ text: `Tip: Try /group hiscores metric: zulrah` });

    await interaction.editReply({ embeds: [response] });
  }
}

function getValue(result: GroupHiscoresEntry): string {
  if ('level' in result.data) {
    return `${result.data.level} (${formatNumber(result.data.experience || 0, true)})`;
  }

  if ('kills' in result.data) {
    return `${formatNumber(result.data.kills || 0, true)}`;
  }

  if ('score' in result.data) {
    return `${formatNumber(result.data.score || 0, true)}`;
  }

  return `${result.data.value || 0}`;
}

export default new GroupHiscoresCommand();
