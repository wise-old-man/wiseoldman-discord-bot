import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class GroupDetailsCommand implements SubCommand {
  subcommand?: boolean | undefined;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.requiresGroup = true;

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
      const group = await fetchGroupDetails(groupId);
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
      throw new CommandError(e.response?.data?.message);
    }
  }
}

export default new GroupDetailsCommand();
