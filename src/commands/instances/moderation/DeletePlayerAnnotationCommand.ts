import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { deletePlayerAnnotation } from '../../../services/wiseoldman';
import { PlayerAnnotationType } from '@wise-old-man/utils';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'remove-player-annotation',
  description: 'Remove a player annotation.',
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
      description: 'The annotation type.',
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

class DeletePlayerAnnotationCommand extends Command {
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
        `✅ Successfully removed annotation \`${annotation}\` for player \`${playerName}\`!`
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

export default new DeletePlayerAnnotationCommand();
