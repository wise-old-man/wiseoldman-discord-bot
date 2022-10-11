import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import {
  Period,
  RecordLeaderboardEntry,
  getMetricName,
  formatNumber,
  PERIODS,
  PeriodProps,
  Metric,
  parseMetricAbbreviation
} from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class GroupRecordsCommand implements SubCommand {
  subcommand?: boolean | undefined;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.requiresGroup = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addStringOption(option =>
        option
          .setName('metric')
          .setDescription('The category to show records for')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('period')
          .setDescription('The period to show records for')
          .addChoices(PERIODS.map(p => [PeriodProps[p].name, p]))
          .setRequired(true)
      )
      .setName('records')
      .setDescription("View the group's records.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const metric = parseMetricAbbreviation(message.options.getString('metric', true)) || Metric.OVERALL;
    const period = message.options.getString('period', true) as Period;

    try {
      const group = await womClient.groups.getGroupDetails(groupId);
      const records = await womClient.groups.getGroupRecords(groupId, { period, metric });

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} records (${period})`)
        .setDescription(this.buildList(records))
        .setURL(`https://wiseoldman.net/groups/${groupId}/records/`)
        .setFooter({ text: `Tip: Try /group records metric: zulrah period: day` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(records: RecordLeaderboardEntry[]) {
    return records
      .map((g, i) => `${i + 1}. **${g.player.displayName}** - ${formatNumber(g.value, true)}`)
      .join('\n');
  }
}

export default new GroupRecordsCommand();
