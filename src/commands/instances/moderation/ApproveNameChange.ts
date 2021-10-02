import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { approve } from '../../../api/modules/names';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class ApproveNameChange implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = 'Approve a name change request';
    this.template = '!approve-name {nameChangeId}';
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Name change id').setRequired(true)
      )
      .setName('approve-name')
      .setDescription('Approve a name change request');
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'approve-name' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      if (!hasModeratorRole(message.member as GuildMember)) {
        message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
        return;
      }

      const nameChangeId = message.options.getInteger('id', true);

      try {
        const nameChange = await approve(nameChangeId);

        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setTitle(
            `${getEmoji('success')} Name change approved: ${nameChange.oldName} → ${nameChange.newName}`
          );

        message.reply({ embeds: [response] });
      } catch (error) {
        throw new CommandError('Failed to approve name change.');
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /approve-name {id}'
      );
    }
  }

  getNameChangeId(message: ParsedMessage): number | null {
    const match = message.args.find(a => !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }
}

export default new ApproveNameChange();
