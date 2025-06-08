import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { addPlayerAnnotation } from '../../../services/wiseoldman';
import { PlayerAnnotationType } from '@wise-old-man/utils';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'add-player-annotation',
  description: 'Add a player annotation.',
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

class AddPlayerAnnotationCommand extends Command {
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

    await addPlayerAnnotation(playerName, annotation).catch(e => {
      if (e.statusCode === 404 || e.statusCode === 409) throw new CommandError(`${e.message}`);
      throw e;
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(
        `✅ Successfully created annotation \`${annotation}\` for player \`${playerName}\`!`
      );
    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Added Player Annotation**\nPlayer: \`${playerName}\`\nAnnotation: \`${annotation}\`` +
        (requesterId
          ? `\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester?.user.username}\``
          : ''),
      interaction.user
    );
  }
}

export default new AddPlayerAnnotationCommand();
