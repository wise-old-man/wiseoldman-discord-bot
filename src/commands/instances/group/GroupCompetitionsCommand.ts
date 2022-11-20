import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CompetitionListItem, CompetitionStatus, CompetitionTypeProps } from '@wise-old-man/utils';
import { getCompetitionStatus, getCompetitionTimeLeft } from '../../../api/modules/competitions';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import womClient from '../../../api/wom-api';
import { CommandConfig, setupCommand } from '../../../utils/commands';
import { CommandErrorAlt, ErrorCode, handleError } from '../../../utils/error';
import { getLinkedGroupId } from '../../../utils/wooow';

const MAX_COMPETITIONS = 5;

const STATUS_PRIORITY_ORDER = [
  CompetitionStatus.ONGOING,
  CompetitionStatus.UPCOMING,
  CompetitionStatus.FINISHED
];

const CONFIG: CommandConfig = {
  name: 'competitions',
  description: "View a group's most recent competitions."
};

class GroupCompetitionsCommand implements SubCommand {
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

      const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
        throw new CommandErrorAlt(ErrorCode.GROUP_NOT_FOUND);
      });

      const competitions = await womClient.groups.getGroupCompetitions(groupId).catch(() => {
        throw new CommandErrorAlt(ErrorCode.NO_COMPETITIONS_FOUND);
      });

      if (competitions.length === 0) {
        throw new CommandErrorAlt(ErrorCode.NO_COMPETITIONS_FOUND);
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${group.name} - Most Recent Competitions`)
        .setURL(`https://wiseoldman.net/groups/${groupId}/competitions`)
        .addFields(this.buildCompetitionsList(competitions));

      await interaction.editReply({ embeds: [response] });
    } catch (error) {
      handleError(interaction, error);
    }
  }

  buildCompetitionsList(competitions: CompetitionListItem[]) {
    return competitions
      .map(c => ({ ...c, status: getCompetitionStatus(c) }))
      .sort(
        (a, b) =>
          STATUS_PRIORITY_ORDER.indexOf(a.status) - STATUS_PRIORITY_ORDER.indexOf(b.status) ||
          a.startsAt.getTime() - b.startsAt.getTime() ||
          a.endsAt.getTime() - b.endsAt.getTime()
      )
      .slice(0, MAX_COMPETITIONS)
      .map(c => {
        const { id, metric, type, participantCount } = c;

        const icon = getEmoji(metric);
        const typeName = CompetitionTypeProps[type].name;
        const timeLeft = getCompetitionTimeLeft(c);
        const participants = `${participantCount} participants`;

        return {
          name: `${c.title}`,
          value: `${icon} • ${typeName} • ${participants} • ${timeLeft} - ID: ${id}`
        };
      });
  }
}

export default new GroupCompetitionsCommand();
