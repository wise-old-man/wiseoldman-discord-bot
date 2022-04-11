import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { getServer } from '../../../database/services/server';
import { SubCommand, ParsedMessage } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class GroupDetails implements SubCommand {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = 'View group details';
    this.template = '!group details';
    this.requiresGroup = true;
    this.slashCommand = new SlashCommandSubcommandBuilder()
      .setName('details')
      .setDescription('View group details');
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'group' && message.args.length > 0 && message.args[0] === 'details';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
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

        message.reply({ embeds: [response] });
      } catch (e: any) {
        throw new CommandError(e.response?.data?.message);
      }
    } else {
      throw new CommandError('This command has been changed to a slash command!', 'Try /group details');
    }
  }
}

export default new GroupDetails();
