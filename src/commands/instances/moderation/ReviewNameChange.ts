import { MessageEmbed } from 'discord.js';
import { reviewNameChange } from '../../../api/modules/names';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils/discord';
import CommandError from '../../CommandError';

class ReviewNameChange implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Review a name change request';
    this.template = '!review-name {nameChangeId}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'review-name' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    const nameChangeId = this.getNameChangeId(message);

    if (!nameChangeId) throw new CommandError('Invalid name change id.');

    try {
      const reviewData = await reviewNameChange(nameChangeId);

      if (reviewData.status !== 0) {
        throw new CommandError('This name change is not pending.');
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`Name change review: ${reviewData.oldName} → ${reviewData.newName}`)
        .setDescription(this.buildReviewMessage(reviewData));

      message.respond(response);
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

  getNameChangeId(message: ParsedMessage): number | null {
    const match = message.args.find(a => !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }
}

export default new ReviewNameChange();
