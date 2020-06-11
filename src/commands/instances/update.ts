import axios from 'axios';
import { Message } from 'discord.js';
import config from '../../config';
import { Command } from '../../types';
import { getEmoji } from '../../utils';
import { parseCommand } from '../parser';

class UpdateCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'Update player';
    this.template = '!update {username}';
  }

  activated(message: Message) {
    const { primary } = parseCommand(message.content);
    return primary === 'update';
  }

  async execute(message: Message) {
    const { options } = parseCommand(message.content);
    const username = options.join(' ');

    try {
      const result = await this.updatePlayer(username);

      const response = `${getEmoji('success')} Successfully updated ${result.displayName}`;
      message.channel.send(response);
    } catch (e) {
      if (e.response?.status === 500) {
        const response = `${getEmoji('error')} Failed to update: Invalid username.`;
        message.channel.send(response);
      } else {
        const errorMessage = e.response?.data?.message || `Failed to update ${username}.`;
        const response = `${getEmoji('error')} ${errorMessage}`;
        message.channel.send(response);
      }
    }
  }

  async updatePlayer(username: string) {
    const URL = `${config.baseAPIUrl}/players/track`;
    const { data } = await axios.post(URL, { username });
    return data;
  }
}

export default new UpdateCommand();
