import { MessageEmbed } from 'discord.js';
import { uniq } from 'lodash';
import config from '../../config';
import { BroadcastType, Event } from '../../types';
import { getEmoji, toKMB, broadcastMessage } from '../../utils';

interface CompetitionStanding {
  displayName: string;
  teamName: string | null;
  gained: number;
}

interface CompetitionEndedData {
  groupId: number;
  competition: {
    id: number;
    type: string;
    metric: string;
    title: string;
    duration: string;
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

    const isTeamCompetition = competition.type === 'team';
    const url = `https://wiseoldman.net/competitions/${id}`;

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} ${title} has ended!`)
      .setURL(url)
      .addFields([
        {
          name: isTeamCompetition ? 'Top Teams' : 'Top participants',
          value: isTeamCompetition ? getTeamStandings(standings) : getStandings(standings)
        }
      ]);

    broadcastMessage(groupId, BroadcastType.CompetitionStatus, message);
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
    .map((t, i) => `${getStandingEmoji(i + 1)} ${i + 1}. ${t.name} - **${toKMB(t.totalGained)}**`)
    .join('\n');
}

function getStandings(standings: CompetitionStanding[]): string {
  return standings
    .slice(0, 3)
    .map((s, i) => `${getStandingEmoji(i + 1)} ${i + 1}. ${s.displayName} - **${toKMB(s.gained)}**`)
    .join('\n');
}

function getStandingEmoji(place: number) {
  switch (place) {
    case 1:
      return getEmoji('gold_medal');
    case 2:
      return getEmoji('silver_medal');
    case 3:
      return getEmoji('bronze_medal');
  }
}

export default new CompetitionEnded();
