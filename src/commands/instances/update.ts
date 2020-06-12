import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { Command, ParsedMessage } from '../../types';

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

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`Successfully updated **${result.displayName}**.`);

      message.respond(response);
    } catch (e) {
      if (e.response?.status === 500) {
        const response = new MessageEmbed()
          .setColor(config.visuals.red)
          .setDescription(`Failed to update **${username}**: Invalid username.`);

        message.respond(response);
      } else {
        const response = new MessageEmbed()
          .setColor(config.visuals.red)
          .setDescription(e.response?.data?.message || `Failed to update **${username}**.`);

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
