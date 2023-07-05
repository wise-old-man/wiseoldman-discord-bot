import { CommandInteraction, MessageEmbed } from 'discord.js';
import { deletePlayer } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-player',
  description: 'Delete a player from the database.',
  options: [
    {
      type: 'string',
      required: true,
      name: 'username',
      description: 'The username of the player to delete.'
    },
    {
      type: 'user',
      name: 'requester',
      description: "Requester's Discord user tag."
    }
  ]
};

class DeletePlayerCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true);
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await deletePlayer(username).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Player not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ \`${username}\` has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Deleted player (Username: ${username})`,
      interaction.user,
      requester?.user
    );
  }
}

export default new DeletePlayerCommand();
