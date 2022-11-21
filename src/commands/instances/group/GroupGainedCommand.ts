import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { formatNumber, getMetricName, Metric, parseMetricAbbreviation } from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { CommandConfig, setupCommand } from '../../../utils/commands';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import { bold, getLinkedGroupId } from 'src/utils/wooow';
import { CommandErrorAlt, ErrorCode, handleError } from 'src/utils/error';

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

class GroupGainedCommand implements SubCommand {
  subcommand?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.slashCommand = setupCommand(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      const groupId = await getLinkedGroupId(interaction);

      // Extract the "metric" param, or fallback to "overall"
      const metricParam = parseMetricAbbreviation(interaction.options.getString('metric', true));  
      const metric = metricParam || Metric.OVERALL;

      // Extract the "period" param,
      const period = interaction.options.getString('period', true);

      const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
        throw new CommandErrorAlt(ErrorCode.GROUP_NOT_FOUND);
      });

      const gained = await womClient.groups.getGroupGains(groupId, { period, metric });

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
        .setURL(`https://wiseoldman.net/groups/${groupId}/gained/`)
        .setFooter({ text: `Tip: Try /group gained metric: zulrah period: day` })
        .setDescription(
          gained
            .map((g, i) => `${i + 1}. ${bold(g.player.displayName)} - ${formatNumber(g.gained, true)}`)
            .join('\n')
        );

      await interaction.editReply({ embeds: [response] });
    } catch (error) {
      handleError(interaction, error);
    }
  }
}

export default new GroupGainedCommand();
