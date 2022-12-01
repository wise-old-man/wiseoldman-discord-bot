import { CompetitionListItem, CompetitionStatus, CompetitionTypeProps } from '@wise-old-man/utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient, { getCompetitionStatus, getCompetitionTimeLeft } from '~/services/wiseoldman';
import config from '~/config';
import { Command, CommandConfig, CommandError, getEmoji, getLinkedGroupId } from '~/utils';

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

class GroupCompetitionsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
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

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${group.name} - Most Recent Competitions`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/competitions`)
      .addFields(buildCompetitionsList(competitions));

    await interaction.editReply({ embeds: [response] });
  }
}

function buildCompetitionsList(competitions: CompetitionListItem[]) {
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

export default new GroupCompetitionsCommand();
