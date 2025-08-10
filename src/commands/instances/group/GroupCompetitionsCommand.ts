import {
  CompetitionResponse,
  CompetitionStatus,
  CompetitionTypeProps,
  GroupDetailsResponse
} from '@wise-old-man/utils';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient, { getCompetitionStatus, getCompetitionTimeLeft } from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '../../../utils';
import { createPaginatedEmbed } from '../../pagination';

const COMPETITIONS_PER_PAGE = 5;

const STATUS_PRIORITY_ORDER = [
  CompetitionStatus.ONGOING,
  CompetitionStatus.UPCOMING,
  CompetitionStatus.FINISHED
];

const CONFIG: CommandConfig = {
  name: 'competitions',
  description: "View a group's most recent competitions."
};

class GroupCompetitionsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    const competitions = await womClient.groups.getGroupCompetitions(groupId).catch(() => {
      throw new CommandError("Couldn't find any competitions for this group.");
    });

    if (competitions.length === 0) {
      throw new CommandError("Couldn't find any competitions for this group.");
    }

    // 25 is max amount of pages an embed can have. So no reason to work with more than this amount.
    const pages = buildPages(group, competitions.slice(0, COMPETITIONS_PER_PAGE * 25));

    if (pages.length === 1) {
      const response = pages[0]
        .setColor(config.visuals.blue)
        .setTitle(`${group.name} - Most Recent Competitions`)
        .setURL(`https://wiseoldman.net/groups/${groupId}/competitions`);

      await interaction.editReply({ embeds: [response] });
      return;
    }

    const embedTemplate = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${group.name} - Most Recent Competitions`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/competitions`);

    const paginatedMessage = createPaginatedEmbed(embedTemplate, 120_000);

    for (const page of pages) {
      paginatedMessage.addPageEmbed(page);
    }

    paginatedMessage.run(interaction);
  }
}

function buildCompetitionsList(competitions: CompetitionResponse[]) {
  return competitions
    .map(c => ({ ...c, status: getCompetitionStatus(c) }))
    .sort(
      (a, b) =>
        STATUS_PRIORITY_ORDER.indexOf(a.status) - STATUS_PRIORITY_ORDER.indexOf(b.status) ||
        b.startsAt.getTime() - a.startsAt.getTime() ||
        b.endsAt.getTime() - a.endsAt.getTime()
    )
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

function buildPages(group: GroupDetailsResponse, competitions: CompetitionResponse[]) {
  const competitionsList = buildCompetitionsList(competitions);
  const pageCount = Math.ceil(competitionsList.length / COMPETITIONS_PER_PAGE);

  if (pageCount === 0) {
    throw new CommandError("Couldn't find any competitions for this group.");
  }

  const pages: Array<EmbedBuilder> = [];

  for (let i = 0; i < pageCount; i++) {
    const pageCompetitions = competitionsList.slice(
      i * COMPETITIONS_PER_PAGE,
      i * COMPETITIONS_PER_PAGE + COMPETITIONS_PER_PAGE
    );

    pages.push(
      new EmbedBuilder().setTitle(`${group.name} - Most Recent Competitions`).addFields(
        pageCompetitions.map(c => {
          return { name: c.name, value: c.value };
        })
      )
    );
  }

  return pages;
}

export default new GroupCompetitionsCommand();
