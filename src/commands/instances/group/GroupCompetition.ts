import { MessageEmbed } from 'discord.js';
import { capitalize, uniq } from 'lodash';
import { fetchCompetition, getCompetitionStatus } from '../../../api/modules/competitions';
import { fetchGroupCompetitions } from '../../../api/modules/groups';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupCompetition implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = "View a group's ongoing/upcoming competition";
    this.template = '!group competition [--ongoing/--upcoming]';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'group' && message.args.length > 0 && message.args[0] === 'competition';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.originServer?.groupId || -1;
    const status = this.getStatusArgs(message.args);

    try {
      const competitions = await fetchGroupCompetitions(groupId);
      const competitionId = this.getSelectedCompetitionId(competitions, status, message.prefix);
      const competition = await fetchCompetition(competitionId);

      const pageURL = `https://wiseoldman.net/competitions/${competition.id}/`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(competition.title)
        .setURL(pageURL)
        .setDescription(this.buildContent(competition))
        .setTimestamp(this.getFooterDate(competition))
        .setFooter(this.getFooterLabel(competition));

      message.respond(response);
    } catch (e) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.message, e.tip);
      }
    }
  }

  getFooterDate(competition: Competition) {
    const status = getCompetitionStatus(competition);

    if (status === 'upcoming') {
      return new Date(competition.startsAt);
    } else {
      return new Date(competition.endsAt);
    }
  }

  getFooterLabel(competition: Competition) {
    const status = getCompetitionStatus(competition);

    if (status === 'upcoming') {
      return 'Starts at';
    } else if (status === 'ongoing') {
      return 'Ends at';
    } else {
      return 'Ended at';
    }
  }

  buildContent(competition: Competition) {
    const isTeamCompetition = competition.type === 'team';

    const lines = [
      `**Metric:**: ${getEmoji(competition.metric)} ${getMetricName(competition.metric)}`,
      `**Type:**: ${capitalize(competition.type)}`,
      `**Participants:** ${competition.participants.length}`,
      `**Duration:** ${competition.duration}`,
      `**Total gained:** ${toKMB(competition.totalGained || 0)}`,
      ''
    ];

    if (isTeamCompetition) {
      lines.push('**Teams:**');
      lines.push(...this.getTeamData(competition));
    } else {
      lines.push('**Top Participants:**');
      lines.push(...this.getParticipantData(competition));
    }

    return lines.join('\n');
  }

  getTeamData(competition: Competition) {
    const { participants } = competition;

    if (!participants || participants.length === 0) return [];

    const teamNames = uniq(participants.map(p => p.teamName));
    const teamTally: { [name: string]: number } = Object.fromEntries(teamNames.map(t => [t, 0]));

    participants.forEach(p => {
      if (!p.teamName) return;
      teamTally[p.teamName] = teamTally[p.teamName] + p.progress.gained;
    });

    const teamStandings = Object.entries(teamTally).map(t => ({ name: t[0], totalGained: t[1] }));

    // Sort teams by most total gained
    return teamStandings
      .sort((a, b) => b.totalGained - a.totalGained)
      .map(t => `${t.name} - **${toKMB(t.totalGained)}**`);
  }

  getParticipantData(competition: Competition) {
    return competition.participants
      .slice(0, 10)
      .map(p => `${p.displayName} - **${toKMB(p.progress.gained)}**`);
  }

  getSelectedCompetitionId(competitions: Competition[], status: string, prefix: string) {
    if (status === 'ongoing') {
      const ongoing = competitions.find(c => getCompetitionStatus(c) === 'ongoing');

      if (!ongoing) {
        throw new CommandError(
          'There are no ongoing competitions for this group.',
          `Try ${prefix}group competition --upcoming`
        );
      }

      return ongoing.id;
    } else if (status === 'upcoming') {
      const upcoming = competitions.find(c => getCompetitionStatus(c) === 'upcoming');

      if (!upcoming) {
        throw new CommandError(
          'There are no upcoming competitions for this group.',
          `Try ${prefix}group competition --ongoing`
        );
      }

      return upcoming.id;
    } else {
      throw new CommandError(`${status} is not a valid status.`, 'Try --ongoing or --upcoming');
    }
  }

  getStatusArgs(args: string[]): string {
    return args.find(a => a.startsWith('--'))?.replace('--', '') || 'ongoing';
  }
}

export default new GroupCompetition();
