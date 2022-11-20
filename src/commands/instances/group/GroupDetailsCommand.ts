import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { getServer } from '../../../services/prisma';
import { SubCommand } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class GroupDetailsCommand implements SubCommand {
  subcommand?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .setName('details')
      .setDescription("View the group's details.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    try {
      const group = await womClient.groups.getGroupDetails(groupId);
      const pageURL = `https://wiseoldman.net/groups/${group.id}`;

      const verification = group.verified
        ? `${getEmoji('success')} Verified`
        : `${getEmoji('error')} Unverified`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(group.name)
        .setURL(pageURL)
        .addFields([
          { name: 'Clan chat', value: group.clanChat || '---' },
          { name: 'Members', value: group.memberCount?.toString() || '0' },
          { name: 'Created at', value: formatDate(group.createdAt, 'DD MMM, YYYY') },
          { name: '\u200B', value: verification }
        ]);

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }
}

export default new GroupDetailsCommand();
