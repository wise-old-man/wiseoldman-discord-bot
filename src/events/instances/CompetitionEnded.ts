import { CompetitionType, formatNumber, Metric } from '@wise-old-man/utils';
import { MessageEmbed } from 'discord.js';
import { uniq } from 'lodash';
import config from '../../config';
import { Event } from '../../utils/events';
import { bold, broadcastMessage, BroadcastType } from '../../utils';

interface CompetitionStanding {
  gained: number;
  displayName: string;
  teamName: string | null;
}

interface CompetitionEndedData {
  groupId: number;
  competition: {
    id: number;
    title: string;
    metric: Metric;
    type: CompetitionType;
  };
  standings: CompetitionStanding[];
}

class CompetitionEnded implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_ENDED';
  }

  async execute(data: CompetitionEndedData): Promise<void> {
    const { groupId, competition, standings } = data;
    const { id, title } = competition;

    if (!groupId) return;

    const isTeamCompetition = competition.type === CompetitionType.TEAM;
    const topParticipations = isTeamCompetition ? getTeamStandings(standings) : getStandings(standings);

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`📢 ${title} has ended!`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields([
        {
          name: isTeamCompetition ? 'Top Teams' : 'Top participants',
          value: topParticipations ? topParticipations : '--'
        }
      ]);

    broadcastMessage(groupId, BroadcastType.COMPETITION_STATUS, message);
  }
}

function getTeamStandings(standings: CompetitionStanding[]): string {
  const teamNames = uniq(standings.map(p => p.teamName));
  const teamTally: { [name: string]: number } = Object.fromEntries(teamNames.map(t => [t, 0]));

  standings.forEach(s => {
    if (!s.teamName) return;
    teamTally[s.teamName] = teamTally[s.teamName] + s.gained;
  });

  const teamStandings = Object.entries(teamTally).map(t => ({ name: t[0], totalGained: t[1] }));

  return teamStandings
    .sort((a, b) => b.totalGained - a.totalGained)
    .slice(0, 3)
    .map(
      (t, i) =>
        `${getStandingEmoji(i + 1)} ${i + 1}. ${t.name} - ${bold(formatNumber(t.totalGained, true))}`
    )
    .join('\n');
}

function getStandings(standings: CompetitionStanding[]): string {
  return standings
    .slice(0, 3)
    .map(
      (s, i) =>
        `${getStandingEmoji(i + 1)} ${i + 1}. ${s.displayName} - ${bold(formatNumber(s.gained, true))}`
    )
    .join('\n');
}

function getStandingEmoji(place: number) {
  switch (place) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
  }
}

export default new CompetitionEnded();
