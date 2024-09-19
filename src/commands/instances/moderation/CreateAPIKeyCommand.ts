import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { createAPIKey } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'create-api-key',
  description: 'Create a new Wise Old Man API key.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
      name: 'project',
      description: 'The name of the project this key is meant to be used by.'
    },
    {
      type: ApplicationCommandOptionType.User,
      required: true,
      name: 'requester',
      description: "Requester's Discord user tag."
    }
  ]
};

class CreateAPIKeyCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    const project = interaction.options.getString('project', true);
    const requesterId = interaction.options.getUser('requester', true).id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    if (!requester) throw new Error();

    const sentDM = await requester.send(`Generating API key...`).catch(() => {
      throw new CommandError(
        `Failed to send DM to <@${requesterId}>. Please go into Privacy Settings and enable Direct Messages.`
      );
    });

    const key = await createAPIKey(project, requester.user.username).catch(e => {
      sentDM.edit('Failed to generate API key.');
      throw e;
    });

    sentDM.edit(
      `Wise Old Man API key for \`${project}\`:\n\`${key.id}\`\n\n<https://docs.wiseoldman.net/#rate-limits--api-keys>`
    );

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(`✅ API key created for "${project}". A DM has been sent to <@${requesterId}>.`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**API Key Created**\nProject: \`${project}\`\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester.user.username}\``,
      interaction.user
    );

    // Add the "API Consumer" role to the user
    requester.roles.add(config.discord.roles.apiConsumer).catch(console.log);
  }
}

export default new CreateAPIKeyCommand();
