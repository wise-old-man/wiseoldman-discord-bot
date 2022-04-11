import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupGained } from '../../../api/modules/groups';
import { GroupGainedEntry } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupGained implements SubCommand {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = 'View group gains';
    this.template = '!group gained {metric}? [--6h/--day/--week/--month/--year]';
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
      .setDescription('View group gains');
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'gained';
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
        const gained = await fetchGroupGained(groupId, period, metric);

        const response = new MessageEmbed()
          .setColor(config.visuals.blue)
          .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} gains (${period})`)
          .setDescription(this.buildList(gained))
          .setURL(`https://wiseoldman.net/groups/${groupId}/gained/`)
          .setFooter({ text: `Tip: Try /group gained metric: zulrah period: day` });

        message.reply({ embeds: [response] });
      } catch (e: any) {
        throw new CommandError(e.response?.data?.message);
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /group gained metric: zulrah period: day'
      );
    }
  }

  buildList(gained: GroupGainedEntry[]) {
    return gained.map((g, i) => `${i + 1}. **${g.player.displayName}** - ${toKMB(g.gained)}`).join('\n');
  }
}

export default new GroupGained();
