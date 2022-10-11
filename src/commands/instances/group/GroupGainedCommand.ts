import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import {
  DeltaLeaderboardEntry,
  formatNumber,
  getMetricName,
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

class GroupGainedCommand implements SubCommand {
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
          .setDescription('The category to show gains for')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('period')
          .setDescription('You can use custom periods with this format: 1y6d5h')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .setName('gained')
      .setDescription("View the group's gains.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const metric = parseMetricAbbreviation(message.options.getString('metric', true)) || Metric.OVERALL;
    const period = message.options.getString('period', true);
    try {
      const group = await womClient.groups.getGroupDetails(groupId);
      const gained = await womClient.groups.getGroupGains(groupId, { period, metric });

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
        .setDescription(this.buildList(gained))
        .setURL(`https://wiseoldman.net/groups/${groupId}/gained/`)
        .setFooter({ text: `Tip: Try /group gained metric: zulrah period: day` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(gained: DeltaLeaderboardEntry[]) {
    return gained
      .map((g, i) => `${i + 1}. **${g.player.displayName}** - ${formatNumber(g.gained, true)}`)
      .join('\n');
  }
}

export default new GroupGainedCommand();
