import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import {
  GroupHiscoresEntry,
  getMetricName,
  formatNumber,
  Metric,
  parseMetricAbbreviation
} from '@wise-old-man/utils';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class GroupHiscoresCommand implements SubCommand {
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
          .setDescription('The category to show hiscoes for')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .setName('hiscores')
      .setDescription("View the group's hiscores.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const metric = parseMetricAbbreviation(message.options.getString('metric', true)) || Metric.OVERALL;

    try {
      const group = await womClient.groups.getGroupDetails(groupId);
      const hiscores = await womClient.groups.getGroupHiscores(groupId, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} hiscores`)
        .setDescription(this.buildList(hiscores))
        .setURL(`https://wiseoldman.net/groups/${groupId}/hiscores/`)
        .setFooter({ text: `Tip: Try /group hiscores metric: zulrah` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(hiscores: GroupHiscoresEntry[]): string {
    return hiscores
      .map((g, i) => `${i + 1}. **${g.player.displayName}** - ${this.getValue(g)}`)
      .join('\n');
  }

  getValue(result: GroupHiscoresEntry): string {
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
}

export default new GroupHiscoresCommand();
