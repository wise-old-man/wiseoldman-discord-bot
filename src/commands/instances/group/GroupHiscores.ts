import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupHiscores } from '../../../api/modules/groups';
import { GroupHiscoresEntry } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, isActivity, isBoss, isSkill, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupHiscores implements SubCommand {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = 'View group hiscores';
    this.template = '!group hiscores {metric}?';
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
      .setDescription('View group hiscores');
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'hiscores';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
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

        message.reply({ embeds: [response] });
      } catch (e: any) {
        throw new CommandError(e.response?.data?.message);
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /group hiscores metric: zulrah'
      );
    }
  }

  buildList(metric: string, hiscores: GroupHiscoresEntry[]) {
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

export default new GroupHiscores();
