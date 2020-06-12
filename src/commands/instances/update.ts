import axios from 'axios';
import config from '../../config';
import { Command, ParsedMessage } from '../../types';
import { getEmoji } from '../../utils';

class UpdateCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

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
      const result = await this.updatePlayer(username);

      const response = `${getEmoji('success')} Successfully updated ${result.displayName}`;
      message.respond(response);
    } catch (e) {
      if (e.response?.status === 500) {
        const response = `${getEmoji('error')} Failed to update: Invalid username.`;
        message.respond(response);
      } else {
        const errorMessage = e.response?.data?.message || `Failed to update ${username}.`;
        const response = `${getEmoji('error')} ${errorMessage}`;
        message.respond(response);
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
