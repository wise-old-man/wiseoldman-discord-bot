import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { updateGroup } from '../../../database/services/server';
import { Command } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigGroup implements Command {
  requiresAdmin: boolean;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.requiresAdmin = true;
    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addIntegerOption(option =>
        option.setName('group_id').setDescription('Group id').setRequired(true)
      )
      .setName('group')
      .setDescription("Configure the server's Wise Old Man group");
    this.subcommand = true;
  }

  async execute(message: CommandInteraction) {
    const groupId = message.options.getInteger('group_id', true);

    try {
      await message.deferReply();

      const group = await fetchGroupDetails(groupId);

      const guildId = message.guild?.id || '';
      await updateGroup(guildId, groupId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Server group updated`)
        .setDescription(`All broadcasts and commands will be in reference to **${group.name}**`)
        .addFields({ name: 'Page URL', value: `https://wiseoldman.net/groups/${groupId}` });

      await message.editReply({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError("Failed to update the server's group.");
      }
    }
  }
}

export default new ConfigGroup();
