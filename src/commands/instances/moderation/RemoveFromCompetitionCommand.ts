import { CommandInteraction, MessageEmbed } from 'discord.js';
import { removeFromCompetition } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, sendModLog } from '../../../utils';

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
    },
    {
      type: 'user',
      name: 'requester',
      description: "Requester's Discord user tag."
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
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ ${username} has been successfully removed from the competition.`);

    try {
      await removeFromCompetition(competitionId, username);

      await interaction.editReply({ embeds: [response] });

      sendModLog(
        interaction.guild,
        `Removed \`${username}\` from competition (ID: ${competitionId})`,
        interaction.user,
        requester?.user
      );
    } catch (e) {
      response.setColor(config.visuals.red).setDescription(`${e.message}`);
      await interaction.editReply({ embeds: [response] });
    }
  }
}

export default new RemoveFromCompetitionCommand();
