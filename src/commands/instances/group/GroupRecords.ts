import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupRecords } from '../../../api/modules/groups';
import { GroupRecordEntry } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupRecords implements SubCommand {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = 'View group records';
    this.template = '!group records {metric}? [--6h/--day/--week/--month/--year]';
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
          .setDescription('You can use custom periods with this format: 1y6d5h')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .setName('records')
      .setDescription('View group records');
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'records';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
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

        message.reply({ embeds: [response] });
      } catch (e: any) {
        throw new CommandError(e.response?.data?.message);
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /group records metric: zulrah period: day'
      );
    }
  }

  buildList(records: GroupRecordEntry[]) {
    return records.map((g, i) => `${i + 1}. **${g.player.displayName}** - ${toKMB(g.value)}`).join('\n');
  }
}

export default new GroupRecords();
