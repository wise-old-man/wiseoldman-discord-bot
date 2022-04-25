import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupRecords } from '../../../api/modules/groups';
import { GroupRecordEntry } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupRecords implements SubCommand {
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
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
          .addChoices([
            ['5 Min', '5min'],
            ['Day', 'day'],
            ['Week', 'week'],
            ['Month', 'month'],
            ['Year', 'year']
          ])
          .setRequired(true)
      )
      .setName('records')
      .setDescription('View group records');
    this.subcommand = true;
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const metric = message.options.getString('metric', true);
    const period = message.options.getString('period', true);

    try {
      const group = await fetchGroupDetails(groupId);
      const records = await fetchGroupRecords(groupId, period, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} records (${period})`)
        .setDescription(this.buildList(records))
        .setURL(`https://wiseoldman.net/groups/${groupId}/records/`)
        .setFooter({ text: `Tip: Try /group records metric: zulrah period: day` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildList(records: GroupRecordEntry[]) {
    return records.map((g, i) => `${i + 1}. **${g.player.displayName}** - ${toKMB(g.value)}`).join('\n');
  }
}

export default new GroupRecords();
