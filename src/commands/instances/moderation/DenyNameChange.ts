import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { deny } from '../../../api/modules/names';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class DenyNameChange implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = 'Deny a name change request';
    this.template = '!deny-name {nameChangeId}';
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Name change id').setRequired(true)
      )
      .setName('deny-name')
      .setDescription('Deny a name change request');
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'deny-name' &&
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
        const nameChange = await deny(nameChangeId);

        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setTitle(
            `${getEmoji('success')} Name change denied: ${nameChange.oldName} → ${nameChange.newName}`
          );

        message.reply({ embeds: [response] });
      } catch (error) {
        throw new CommandError('Failed to deny name change.');
      }
    } else {
      throw new CommandError('This command has been changed to a slash command!', 'Try /deny-name {id}');
    }
  }

  getNameChangeId(message: ParsedMessage): number | null {
    const match = message.args.find(a => !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }
}

export default new DenyNameChange();
