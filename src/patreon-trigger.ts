import fs from 'fs';
import path from 'path';
import {
  ButtonInteraction,
  Client,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  ButtonStyle,
  ChannelType
} from 'discord.js';
import config from './config';
import { hasRole, sendModLog } from './utils';
import { claimBenefits } from './services/wiseoldman';

export const PATREON_MODAL_ID = 'patreon-benefits-modal';

export const PATREON_TRIGGER_ID = 'patreon-benefits-trigger';

const NOT_A_PATRON_ERROR_MESSAGE = `Only Patreon supporters can claim benefits, please consider helping fund the project at https://wiseoldman.net/patreon.\n\nIf you already are a Patreon supporter, make sure to connect your Discord account to your Patreon account.`;

export async function setupPatreonTrigger(client: Client) {
  const patreonInfoChannel = client.channels.cache.get(config.discord.channels.patreonInfo);
  if (patreonInfoChannel?.type !== ChannelType.GuildText) return;

  const messages = await patreonInfoChannel.messages.fetch({ limit: 100 });
  const botMessages = messages.filter(msg => msg.author.id === client.user?.id);

  if (botMessages.size !== 0) {
    // Already posted the Patreon Info message.
    return;
  }

  const content = fs.readFileSync(path.join('src', 'content', 'patreon-info.md'), 'utf8');

  const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(PATREON_TRIGGER_ID)
      .setLabel('Claim Patreon Benefits')
      .setStyle(ButtonStyle.Success)
  );

  const message = await patreonInfoChannel.send({ content, components: [actions] });
  await message.suppressEmbeds(true);
}

export async function handlePatreonTrigger(interaction: ButtonInteraction) {
  if (!interaction.member) return;

  const member = interaction.member as GuildMember;

  if (!hasRole(member, config.discord.roles.patreonSupporter)) {
    await interaction.reply({ content: NOT_A_PATRON_ERROR_MESSAGE, ephemeral: true });
    return;
  }

  const isTier2Supporter = hasRole(member, config.discord.roles.patreonSupporterT2);

  const modal = new ModalBuilder()
    .setCustomId(PATREON_MODAL_ID)
    .setTitle(`Claim Patreon Benefits (Tier ${isTier2Supporter ? 2 : 1})`);

  const usernameInput = new TextInputBuilder()
    .setCustomId('username')
    .setLabel('Your in-game username')
    .setPlaceholder('Ex: Zezima')
    .setMaxLength(12)
    .setStyle(1)
    .setRequired(true);

  const groupIdInput = new TextInputBuilder()
    .setCustomId('groupId')
    .setLabel("Your group's ID")
    .setPlaceholder("Ex: 139 (Can be found on your group's page URL.)")
    .setStyle(1);

  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput));

  if (isTier2Supporter) {
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(groupIdInput));
  }

  interaction.showModal(modal);
}

export async function handlePatreonModalSubmit(interaction: ModalSubmitInteraction) {
  const username = interaction.fields.getTextInputValue('username');

  if (!username) {
    interaction.reply({ content: '❌ Please provide your in-game username.', ephemeral: true });
    return;
  }

  let groupId: number | undefined;

  if (hasRole(interaction.member as GuildMember, config.discord.roles.patreonSupporterT2)) {
    const groupIdValue = interaction.fields.getTextInputValue('groupId');
    const isInteger = typeof groupIdValue === 'string' && Number.isInteger(parseInt(groupIdValue));

    if (!isInteger) {
      interaction.reply({ content: '❌ Please provide a valid group ID.', ephemeral: true });
      return;
    }

    groupId = parseInt(groupIdValue);
  }

  try {
    await claimBenefits(interaction.user.id, username, groupId);

    let successMessage = '✅ Your benefits have been claimed!';

    if (groupId) {
      successMessage += ` You can edit your group's images and social links on your group's edit page on the website.`;
    }

    interaction.reply({ content: successMessage, ephemeral: true });

    sendModLog(
      interaction.guild,
      `${interaction.user} has claimed ${
        groupId ? 'Tier 2' : 'Tier 1'
      } Patreon benefits for: \nUsername: ${username}${groupId ? `\nGroup id: ${groupId}` : ''}`
    );
  } catch (error) {
    interaction.reply({ content: error.message, ephemeral: true });
  }
}
