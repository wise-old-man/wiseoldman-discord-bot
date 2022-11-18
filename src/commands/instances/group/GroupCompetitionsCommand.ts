import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { capitalize } from 'lodash';
import { CompetitionListItem } from '@wise-old-man/utils';
import { getCompetitionStatus, getCompetitionTimeLeft } from '../../../api/modules/competitions';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { getServer } from '../../../services/prisma';
import womClient from '../../../api/wom-api';

const MAX_COMPETITIONS = 5;

const STATUS_ORDER = ['ongoing', 'upcoming', 'finished'];

class GroupCompetitionsCommand implements SubCommand {
  subcommand?: boolean | undefined;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.requiresGroup = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .setName('competitions')
      .setDescription("View the group's competitions.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();
    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    try {
      const group = await womClient.groups.getGroupDetails(groupId);
      const competitions = await womClient.groups.getGroupCompetitions(groupId);

      const fields = this.buildCompetitionsList(competitions);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/competitions`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${group.name} competitions`)
        .setURL(pageURL)
        .addFields(fields);

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildCompetitionsList(competitions: CompetitionListItem[]) {
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

export default new GroupCompetitionsCommand();
