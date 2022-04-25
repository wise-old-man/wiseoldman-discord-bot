import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { reviewNameChange } from '../../../api/modules/names';
import config from '../../../config';
import { Command } from '../../../types';
import { getEmoji } from '../../../utils/discord';
import CommandError from '../../CommandError';

class ReviewNameChange implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('id').setDescription('Name change id').setRequired(true)
      )
      .setName('review-name')
      .setDescription('Review a name change request');
  }

  async execute(message: CommandInteraction) {
    const nameChangeId = message.options.getInteger('id', true);
    try {
      await message.deferReply();
      const reviewData = await reviewNameChange(nameChangeId);

      if (reviewData.status !== 0) {
        throw new CommandError('This name change is not pending.');
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`Name change review: ${reviewData.oldName} → ${reviewData.newName}`)
        .setDescription(this.buildReviewMessage(reviewData));

      await message.editReply({ embeds: [response] });
    } catch (error) {
      if (error instanceof CommandError) throw error;
      throw new CommandError('Failed to review name change.');
    }
  }

  buildReviewMessage(data: any): string {
    const {
      isNewOnHiscores,
      hasNegativeGains,
      hoursDiff,
      ehpDiff,
      ehbDiff,
      expDiff,
      oldTotalLevel,
      newTotalLevel
    } = data;

    const lines = [];

    lines.push(`New name on the hiscores? ${isNewOnHiscores ? getEmoji('success') : getEmoji('error')}`);
    lines.push(`Has no negative gains? ${!hasNegativeGains ? getEmoji('success') : getEmoji('error')}`);
    lines.push(`Hours difference? \`${hoursDiff}\``);
    lines.push(`EHP difference? \`${ehpDiff}\``);
    lines.push(`EHB difference? \`${ehbDiff}\``);
    lines.push(`Exp difference? \`${expDiff}\``);
    lines.push(`Old total level? \`${oldTotalLevel}\``);
    lines.push(`New total level? \`${newTotalLevel}\``);

    return lines.join('\n');
  }
}

export default new ReviewNameChange();
