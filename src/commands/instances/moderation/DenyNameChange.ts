import { MessageEmbed } from 'discord.js';
import { deny } from '../../../api/modules/names';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';

class DenyNameChange implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Deny a name change request';
    this.template = '!deny-name {nameChangeId}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'deny-name' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const nameChangeId = this.getNameChangeId(message);

    if (!nameChangeId) throw new CommandError('Invalid name change id.');

    try {
      const nameChange = await deny(nameChangeId);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(
          `${getEmoji('success')} Name change denied: ${nameChange.oldName} → ${nameChange.newName}`
        );

      message.respond({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to deny name change.');
    }
  }

  getNameChangeId(message: ParsedMessage): number | null {
    const match = message.args.find(a => !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }
}

export default new DenyNameChange();
