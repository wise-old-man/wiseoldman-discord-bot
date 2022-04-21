import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/groups';
import config from '../../../config';
import { updateGroup } from '../../../database/services/server';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigGroup implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;
  slashCommand?: SlashCommandSubcommandBuilder;
  subcommand?: boolean | undefined;

  constructor() {
    this.name = "Configure the server's Wise Old Man group.";
    this.template = '/config group group_id: id';
    this.requiresAdmin = true;
    this.slashCommand = new SlashCommandSubcommandBuilder()
      .addIntegerOption(option =>
        option.setName('group_id').setDescription('Group id').setRequired(true)
      )
      .setName('group')
      .setDescription("Configure the server's Wise Old Man group");
    this.subcommand = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'config' && message.args.length >= 2 && message.args[0] === 'group';
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      const groupId = message.options.getInteger('group_id', true);

      try {
        const group = await fetchGroupDetails(groupId);

        const guildId = message.guild?.id || '';
        await updateGroup(guildId, groupId);

        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setTitle(`${getEmoji('success')} Server group updated`)
          .setDescription(`All broadcasts and commands will be in reference to **${group.name}**`)
          .addFields({ name: 'Page URL', value: `https://wiseoldman.net/groups/${groupId}` });

        message.reply({ embeds: [response] });
      } catch (e: any) {
        if (e.response?.data?.message) {
          throw new CommandError(e.response?.data?.message);
        } else {
          throw new CommandError("Failed to update the server's group.");
        }
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /config group group_id: 2'
      );
    }
  }
}

export default new ConfigGroup();
