import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { capitalize, uniq } from 'lodash';
import { fetchCompetition, getCompetitionStatus } from '../../../api/modules/competitions';
import { fetchGroupCompetitions } from '../../../api/modules/groups';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupCompetition implements SubCommand {
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.requiresGroup = true;
    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('View an ongoing or upcoming group competition')
          .addChoices([
            ['Ongoing', 'ongoing'],
            ['Upcoming', 'upcoming']
          ])
      )
      .addIntegerOption(option => option.setName('competition_id').setDescription('Competition id'))
      .setName('competition')
      .setDescription("View a group's ongoing/upcoming competition");
    this.subcommand = true;
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    const status = message.options.getString('status') || 'ongoing';
    try {
      const competitions = await fetchGroupCompetitions(groupId);
      const competitionId =
        message.options.getInteger('competition_id') ||
        this.getSelectedCompetitionId(competitions, status);
      const competition = await fetchCompetition(competitionId);
      const pageURL = `https://wiseoldman.net/competitions/${competition.id}/`;
      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(competition.title)
        .setURL(pageURL)
        .setDescription(this.buildContent(competition))
        .setTimestamp(this.getFooterDate(competition))
        .setFooter({ text: this.getFooterLabel(competition) });
      await message.editReply({ embeds: [response] });
    } catch (e: any) {
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

  getSelectedCompetitionId(competitions: Competition[], status: string) {
    if (status === 'ongoing') {
      const ongoing = competitions.find(c => getCompetitionStatus(c) === 'ongoing');

      if (!ongoing) {
        throw new CommandError(
          'There are no ongoing competitions for this group.',
          `Try /group competition status: upcoming`
        );
      }

      return ongoing.id;
    } else if (status === 'upcoming') {
      const upcoming = competitions.find(c => getCompetitionStatus(c) === 'upcoming');

      if (!upcoming) {
        throw new CommandError(
          'There are no upcoming competitions for this group.',
          `Try /group competition status: ongoing`
        );
      }

      return upcoming.id;
    } else {
      throw new CommandError(`${status} is not a valid status.`, 'Try --ongoing or --upcoming');
    }
  }
}

export default new GroupCompetition();
