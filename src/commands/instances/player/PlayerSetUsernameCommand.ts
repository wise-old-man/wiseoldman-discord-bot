import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateAlias } from '../../../services/prisma';
import { encodeURL } from '../../../utils/strings';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig } from '../../../commands/utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';

const CONFIG: CommandConfig = {
  name: 'setrsn',
  description: 'Set your default username (alias).',
  options: [
    {
      type: 'string',
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

  async execute(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true);
    const userId = interaction.user.id;

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        ErrorCode.PLAYER_NOT_FOUND,
        "Player not found. Possibly hasn't been tracked yet on WiseOldMan.",
        'Tip: Try tracking them first using the /update command'
      );
    });

    await updateAlias(userId, player.displayName);

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle('Player alias updated!')
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setDescription(`<@${userId}> is now associated with the username \`${player.displayName}\`.`)
      .setFooter({ text: `They can now call any player command without including the username.` });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new PlayerSetUsernameCommand();
