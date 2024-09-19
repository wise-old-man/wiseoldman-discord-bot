import {
  CompetitionDetails,
  CompetitionStatus,
  CompetitionStatusProps,
  CompetitionType,
  CompetitionTypeProps,
  formatNumber,
  isCompetitionStatus,
  MetricProps
} from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { uniq } from 'lodash';
import config from '../../../config';
import womClient, { getCompetitionStatus, getCompetitionTimeLeft } from '../../../services/wiseoldman';
import {
  bold,
  Command,
  CommandConfig,
  CommandError,
  getEmoji,
  getLinkedGroupId,
  keyValue
} from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'competition',
  description: "View a group's ongoing/upcoming competition.",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'competition_id',
      description: 'Competition ID'
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'status',
      description: 'View an ongoing or upcoming group competition.',
      choices: [
        {
          name: CompetitionStatusProps[CompetitionStatus.ONGOING].name,
          value: CompetitionStatus.ONGOING
        },
        {
          name: CompetitionStatusProps[CompetitionStatus.UPCOMING].name,
          value: CompetitionStatus.UPCOMING
        }
      ]
    }
  ]
};

class GroupCompetitionCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    // Extract the "status" param, or fallback to "ongoing"
    const statusParam = interaction.options.getString('status');
    const status =
      statusParam !== null && isCompetitionStatus(statusParam) ? statusParam : CompetitionStatus.ONGOING;

    // Extract the "competition_id" param, or fallback to the default competition
    const competitionIdParam = interaction.options.getInteger('competition_id');
    const competitionId = competitionIdParam || (await getDefaultCompetitionId(groupId, status));

    const competition = await womClient.competitions.getCompetitionDetails(competitionId).catch(() => {
      throw new CommandError("Couldn't find that competition.");
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(competition.title)
      .setURL(`https://league.wiseoldman.net/competitions/${competition.id}/`)
      .setDescription(buildContent(competition))
      .setTimestamp(getFooterDate(competition))
      .setFooter({ text: getFooterLabel(competition) });

    await interaction.editReply({ embeds: [response] });
  }
}

function getFooterDate(competition: CompetitionDetails) {
  return getCompetitionStatus(competition) === CompetitionStatus.UPCOMING
    ? new Date(competition.startsAt)
    : new Date(competition.endsAt);
}

function getFooterLabel(competition: CompetitionDetails) {
  const status = getCompetitionStatus(competition);

  if (status === CompetitionStatus.UPCOMING) return 'Starts at';
  if (status === CompetitionStatus.ONGOING) return 'Ends at';
  return 'Ended at';
}

function buildContent(competition: CompetitionDetails) {
  const { metric, type, participations, participantCount } = competition;
  const timeLeft = getCompetitionTimeLeft(competition).split(' ');

  const lines = [
    keyValue('Metric', `${getEmoji(metric)} ${MetricProps[metric].name}`),
    keyValue('Type', CompetitionTypeProps[type].name),
    keyValue('Participants', participantCount),
    keyValue(timeLeft.slice(0, 2).join(' '), timeLeft.slice(2).join(' '))
  ];

  if (type === CompetitionType.TEAM) {
    const teamStandings = aggregateTeamData(competition);
    const totalGained = teamStandings.reduce((a, b) => a + b.totalGained, 0) || 0;

    lines.push(keyValue('Total gained', formatNumber(totalGained, true)));

    lines.push(bold('\nTeams'));
    lines.push(
      ...teamStandings
        .sort((a, b) => b.totalGained - a.totalGained)
        .map(t => `${t.name} - ${bold(formatNumber(t.totalGained, true))}`)
    );
  } else {
    const totalGained = participations.reduce((a, b) => a + b.progress.gained, 0) || 0;

    lines.push(keyValue('Total gained', formatNumber(totalGained, true)));

    lines.push(bold('\nTop Participants'));
    lines.push(
      ...participations
        .slice(0, 10)
        .map(p => `${p.player.displayName} - ${bold(formatNumber(p.progress.gained, true))}`)
    );
  }

  return lines.join('\n');
}

function aggregateTeamData(competition: CompetitionDetails) {
  const participants = competition.participations;

  if (!participants || participants.length === 0) return [];

  const teamNames = uniq(participants.map(p => p.teamName));
  const teamTally: { [name: string]: number } = Object.fromEntries(teamNames.map(t => [t, 0]));

  participants.forEach(p => {
    if (!p.teamName) return;
    teamTally[p.teamName] = teamTally[p.teamName] + p.progress.gained;
  });

  const teamStandings = Object.entries(teamTally).map(t => ({ name: t[0], totalGained: t[1] }));

  return teamStandings;
}

async function getDefaultCompetitionId(groupId: number, status: CompetitionStatus) {
  const competitions = await womClient.groups.getGroupCompetitions(groupId);

  const match = competitions.find(c => getCompetitionStatus(c) === status);

  if (!match) {
    throw new CommandError(`Couldn't find any ${status} competitions.`);
  }

  return match.id;
}

export default new GroupCompetitionCommand();
