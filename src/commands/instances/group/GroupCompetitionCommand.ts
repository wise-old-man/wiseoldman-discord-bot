import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CompetitionDetails, CompetitionListItem } from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { capitalize, uniq } from 'lodash';
import { getCompetitionStatus, getCompetitionTimeLeft } from '../../../api/modules/competitions';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class GroupCompetitionCommand implements SubCommand {
  subcommand?: boolean | undefined;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.requiresGroup = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('View an ongoing or upcoming group competition.')
          .addChoices([
            ['Ongoing', 'ongoing'],
            ['Upcoming', 'upcoming']
          ])
      )
      .addIntegerOption(option => option.setName('competition_id').setDescription('Competition id'))
      .setName('competition')
      .setDescription("View a group's ongoing/upcoming competition");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    const status = message.options.getString('status') || 'ongoing';

    try {
      const competitions = await womClient.groups.getGroupCompetitions(groupId);

      const competition = await womClient.competitions.getCompetitionDetails(
        message.options.getInteger('competition_id') ||
          this.getSelectedCompetitionId(competitions, status)
      );

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
        throw new CommandError(e.name, e.message);
      }
    }
  }

  getFooterDate(competition: CompetitionDetails) {
    const status = getCompetitionStatus(competition);

    if (status === 'upcoming') {
      return new Date(competition.startsAt);
    } else {
      return new Date(competition.endsAt);
    }
  }

  getFooterLabel(competition: CompetitionDetails) {
    const status = getCompetitionStatus(competition);

    if (status === 'upcoming') {
      return 'Starts at';
    } else if (status === 'ongoing') {
      return 'Ends at';
    } else {
      return 'Ended at';
    }
  }

  buildContent(competition: CompetitionDetails) {
    const isTeamCompetition = competition.type === 'team';
    const timeLeft = getCompetitionTimeLeft(competition).split(' ');

    const lines = [
      `**Metric:** ${getEmoji(competition.metric)} ${getMetricName(competition.metric)}`,
      `**Type:** ${capitalize(competition.type)}`,
      `**Participants:** ${competition.participantCount}`,
      `**${timeLeft.slice(0, 2).join(' ')}:** ${timeLeft.slice(2).join(' ')}`
    ];

    if (isTeamCompetition) {
      const teamStandings = this.getTeamData(competition);

      lines.push(
        `**Total gained:** ${toKMB(teamStandings.reduce((a, b) => a + b.totalGained, 0) || 0)}\n`
      );
      lines.push('**Teams:**');

      lines.push(
        ...teamStandings
          .sort((a, b) => b.totalGained - a.totalGained)
          .map(t => `${t.name} - **${toKMB(t.totalGained)}**`)
      );
    } else {
      lines.push(
        `**Total gained:** ${toKMB(
          competition.participations.reduce((a, b) => a + b.progress.gained, 0) || 0
        )}\n`
      );

      lines.push('**Top Participants:**');
      lines.push(...this.getParticipantData(competition));
    }

    return lines.join('\n');
  }

  getTeamData(competition: CompetitionDetails) {
    const participants = competition.participations;

    if (!participants || participants.length === 0) return [];

    const teamNames = uniq(participants.map(p => p.teamName));
    const teamTally: { [name: string]: number } = Object.fromEntries(teamNames.map(t => [t, 0]));

    participants.forEach(p => {
      if (!p.teamName) return;
      teamTally[p.teamName] = teamTally[p.teamName] + p.progress.gained;
    });

    const teamStandings = Object.entries(teamTally).map(t => ({ name: t[0], totalGained: t[1] }));

    // Sort teams by most total gained
    return teamStandings;
  }

  getParticipantData(competition: CompetitionDetails) {
    return competition.participations
      .slice(0, 10)
      .map(p => `${p.player.displayName} - **${toKMB(p.progress.gained)}**`);
  }

  getSelectedCompetitionId(competitions: CompetitionListItem[], status: string) {
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

export default new GroupCompetitionCommand();
