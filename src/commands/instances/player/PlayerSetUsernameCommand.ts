import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import prisma from '../../../services/prisma';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, encodeURL } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'setrsn',
  description: 'Set your default username (alias).',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username.',
      required: true
    }
  ]
};

class PlayerSetUsernameCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString('username', true);
    const userId = interaction.user.id;

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    // Update the database
    await prisma.alias.upsert({
      where: { userId },
      update: { username },
      create: { userId, username }
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setTitle('Player alias updated!')
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setDescription(`<@${userId}> is now associated with the username \`${player.displayName}\`.`)
      .setFooter({ text: `They can now call any player command without including the username.` });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new PlayerSetUsernameCommand();
