import { MessageEmbed } from 'discord.js';
import { approve } from '../../../api/modules/names';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class ApproveNameChange implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Approve a name change request';
    this.template = '!approve-name {nameChangeId}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'approve-name' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond('Nice try. This command is reserved for Moderators and Admins.');
      return;
    }

    const nameChangeId = this.getNameChangeId(message);

    if (!nameChangeId) throw new CommandError('Invalid name change id.');

    try {
      const nameChange = await approve(nameChangeId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(
          `${getEmoji('success')} Name change approved: ${nameChange.oldName} → ${nameChange.newName}`
        );

      message.respond(response);
    } catch (error) {
      throw new CommandError('Failed to approve name change.');
    }
  }

  getNameChangeId(message: ParsedMessage): number | null {
    const match = message.args.find(a => !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }
}

export default new ApproveNameChange();
