import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { deletePlayerAnnotation } from '../../../services/wiseoldman';
import { PlayerAnnotationType } from '@wise-old-man/utils';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'remove-player-annotation',
  description: 'Delete a player annotation.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'player',
      description: 'The player name.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'annotation',
      description: 'The annotation name.',
      required: true,
      choices: Object.values(PlayerAnnotationType).map(value => ({
        name: value,
        value
      }))
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'requester',
      description: "Requester's Discord user tag."
    }
  ]
};

class DeleteAnnotationCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const playerName = interaction.options.getString('player', true);
    const annotation = interaction.options.getString('annotation', true) as PlayerAnnotationType;
    const requesterId = interaction.options.getUser('requester')?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await deletePlayerAnnotation(playerName, annotation).catch(e => {
      if (e.statusCode === 404) throw new CommandError(`${e.message}`);
      throw e;
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(
        `✅ Annotation \`${annotation}\` for player \`${playerName}\` has been successfully deleted!`
      );
    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Deleted Player Annotation**\nPlayer: \`${playerName}\`\nAnnotation: \`${annotation}\`` +
        (requesterId
          ? `\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester?.user.username}\``
          : ''),
      interaction.user
    );
  }
}

export default new DeleteAnnotationCommand();
