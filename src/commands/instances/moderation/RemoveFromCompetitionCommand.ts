import { CommandInteraction, MessageEmbed } from 'discord.js';
import { removeFromCompetition } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'remove-from-competition',
  description: 'Remove a player from a competition.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The competition ID.',
      required: true
    },
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.',
      required: true
    }
  ]
};

class RemoveFromCompetitionCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const competitionId = interaction.options.getInteger('id', true);
    const username = interaction.options.getString('username', true);

    await removeFromCompetition(competitionId, username);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ ${username} has been successfully removed from the competition.`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new RemoveFromCompetitionCommand();
