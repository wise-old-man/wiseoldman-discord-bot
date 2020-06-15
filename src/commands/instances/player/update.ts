import { MessageEmbed } from 'discord.js';
import { updatePlayer } from '../../../api/modules/player';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import CommandError from '../../CommandError';

class UpdateCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'Update player';
    this.template = '!update {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'update';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');

    try {
      const result = await updatePlayer(username);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`Successfully updated **${result.displayName}**.`);

      message.respond(response);
    } catch (e) {
      if (e.response?.status === 500) {
        throw new CommandError(`Failed to update **${username}**: Invalid username.`);
      } else {
        throw new CommandError(e.response?.data?.message || `Failed to update **${username}**.`);
      }
    }
  }
}

export default new UpdateCommand();
