import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { revokeAPIKey } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'revoke-api-key',
  description: 'Revoke a Wise Old Man API key.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
      name: 'key',
      description: 'The API key to revoke.'
    }
  ]
};

class RevokeAPIKeyCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const key = interaction.options.getString('key', true);

    const { application, developer } = await revokeAPIKey(key).catch(e => {
      if (e.statusCode === 404) throw new CommandError('API key not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(`✅ API key for "${application}" (${developer}) has been revoked.`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**API Key Revoked**\nProject: \`${application}\`\nDeveloper: \`${developer}\``,
      interaction.user
    );
  }
}

export default new RevokeAPIKeyCommand();
