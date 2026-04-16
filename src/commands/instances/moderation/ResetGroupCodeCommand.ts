import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { resetGroupCode, resetLeagueGroupCode } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const DM_MESSAGE = (code: string, groupId: number, webUrl: string) =>
  `Hey! Here's your new verification code for group [${groupId}](<${webUrl}/groups/${groupId}>): \n\`${code}\`\n\nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

const CONFIG: CommandConfig = {
  name: 'reset-group-code',
  description: "Reset a group's verification code.",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'id',
      description: 'The group ID.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'Discord user tag.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'api',
      description: 'The base URL for the API.',
      choices: [
        { name: 'Main', value: "main" },
        { name: 'League', value: "league" }
      ],
      required: true
    }
  ]
};

class ResetGroupCodeCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;
    const apiBase = interaction.options.getString('api', true);

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const sentDM = await user.send('Resetting group code...').catch(e => {
      console.log(e);

      throw new CommandError(
        `Failed to send DM to ${user}. Please go into Privacy Settings and enable Direct Messages.`
      );
    });

    const isMain = apiBase === "main";
    const resetFn = isMain ? resetGroupCode : resetLeagueGroupCode;
    const webUrl = isMain ? "https://wiseoldman.net" : "https://league.wiseoldman.net";

    const { newCode } = await resetFn(groupId).catch(e => {
      sentDM.edit('Failed to generate a new verification code.');
      if (e.statusCode === 404) throw new CommandError(`Group '${groupId}' not found.`);
      throw e;
    });

    // DM the user back with the new verification code
    await sentDM.edit(DM_MESSAGE(newCode, groupId, webUrl));

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Group Code Reset**\nGroup: [${groupId}](<${webUrl}/groups/${groupId}>)\nSent to: <@${userId}>, \`${userId}\`, \`${user.user.username}\``,
      interaction.user
    );
  }
}

export default new ResetGroupCodeCommand();