import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { capitalize } from 'lodash';
import { getCompetitionStatus, getCompetitionTimeLeft } from '../../../api/modules/competitions';
import { fetchGroupCompetitions, fetchGroupDetails } from '../../../api/modules/groups';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { getServer } from '../../../database/services/server';

const MAX_COMPETITIONS = 5;

const STATUS_ORDER = ['ongoing', 'upcoming', 'finished'];

class GroupCompetitions implements SubCommand {
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.requiresGroup = true;
    this.slashCommand = new SlashCommandSubcommandBuilder()
      .setName('competitions')
      .setDescription('View group competitions');
    this.subcommand = true;
  }

  async execute(message: CommandInteraction) {
    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    try {
      const group = await fetchGroupDetails(groupId);
      const competitions = await fetchGroupCompetitions(groupId);
      const fields = this.buildCompetitionsList(competitions);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/competitions`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${group.name} competitions`)
        .setURL(pageURL)
        .addFields(fields);

      message.reply({ embeds: [response] });
    } catch (e: any) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildCompetitionsList(competitions: Competition[]) {
    return competitions
      .map(c => ({ ...c, status: getCompetitionStatus(c) }))
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.startsAt.getTime() - b.startsAt.getTime() ||
          a.endsAt.getTime() - b.endsAt.getTime()
      )
      .slice(0, MAX_COMPETITIONS)
      .map(c => {
        const icon = getEmoji(c.metric);
        const type = capitalize(c.type);
        const timeLeft = getCompetitionTimeLeft(c);
        const participants = `${c.participantCount} participants`;
        const id = c.id;

        return {
          name: `${c.title}`,
          value: `${icon} • ${type} • ${participants} • ${timeLeft} - ID: ${id}`
        };
      });
  }
}

export default new GroupCompetitions();
