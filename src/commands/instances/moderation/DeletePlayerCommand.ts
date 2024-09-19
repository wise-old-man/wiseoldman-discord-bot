import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { deletePlayer } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-player',
  description: 'Delete a player from the database.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
      name: 'username',
      description: 'The username of the player to delete.'
    },
    {
      type: ApplicationCommandOptionType.User,
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

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString('username', true);
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await deletePlayer(username).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Player not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(`✅ \`${username}\` has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Deleted User**\nUsername: \`${username}\`` +
        (requesterId
          ? `\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester?.user.username}\``
          : ''),
      interaction.user
    );
  }
}

export default new DeletePlayerCommand();
