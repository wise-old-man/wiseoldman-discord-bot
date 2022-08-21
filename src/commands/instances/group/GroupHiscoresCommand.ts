import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupHiscores } from '../../../api/modules/groups';
import { GroupHiscoresEntry } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji, getMetricName, isActivity, isBoss, isSkill, toKMB } from '../../../utils';
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
    await message.deferReply(); // defer because things take time

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;
    const metric = message.options.getString('metric', true);

    try {
      const group = await fetchGroupDetails(groupId);
      const hiscores = await fetchGroupHiscores(groupId, metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${getEmoji(metric)} ${group.name} ${getMetricName(metric)} hiscores`)
        .setDescription(this.buildList(metric, hiscores))
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

  buildList(metric: string, hiscores: GroupHiscoresEntry[]): string {
    return hiscores
      .map((g, i) => `${i + 1}. **${g.player.displayName}** - ${this.getValue(metric, g)}`)
      .join('\n');
  }

  getValue(metric: string, result: GroupHiscoresEntry): string {
    if (isSkill(metric)) {
      return `${result.level} (${toKMB(result.experience || 0)})`;
    }

    if (isBoss(metric)) {
      return `${toKMB(result.kills || 0)}`;
    }

    if (isActivity(metric)) {
      return `${toKMB(result.score || 0)}`;
    }

    return `${result.value || 0}`;
  }
}

export default new GroupHiscoresCommand();
