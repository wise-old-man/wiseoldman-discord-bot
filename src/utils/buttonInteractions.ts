import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../config';
import { handlePatreonTrigger, PATREON_TRIGGER_ID } from '../patreon-trigger';
import { approveActions, blockActions } from '../services/wiseoldman';

enum Actions {
  BLOCK = 'block',
  APPROVE = 'approve',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

export enum ModerationType {
  SPAM = 'spam'
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [action, type, ipHash, confirmation] = interaction.customId.split('/');
  let notFound;

  if (action === PATREON_TRIGGER_ID) {
    handlePatreonTrigger(interaction);
  } else if (action === Actions.BLOCK || action === Actions.APPROVE) {
    await interaction.update({
      components: [createConfirmationButtons(action, type as ModerationType, ipHash)]
    });
  } else if (action === Actions.CONFIRM) {
    if (type === ModerationType.SPAM) {
      if (confirmation === Actions.BLOCK) {
        try {
          // TODO handle exceptions correctly
          await blockActions(ipHash).catch(e => {
            if (e.statusCode === 404) notFound = true;
            else throw e;
          });
        } catch (error) {
          await interaction.reply({ ephemeral: false, content: `${error}` });
          return;
        }
      } else if (confirmation === Actions.APPROVE) {
        try {
          await approveActions(ipHash).catch(e => {
            // TODO handle exceptions correctly
            if (e.statusCode === 404) notFound = true;
            else throw e;
          });
        } catch (error) {
          await interaction.reply({ ephemeral: false, content: `${error}` });
          return;
        }
      }
    }

    interaction.update({
      embeds: [await updateEmbed(confirmation, type, interaction, notFound)],
      components: []
    });
  } else if (action === Actions.CANCEL) {
    await interaction.update({
      components: [createModerationButtons(type as ModerationType, ipHash)]
    });
  }
}

async function updateEmbed(
  confirmation: string,
  type: string,
  interaction: ButtonInteraction,
  notFound: boolean
) {
  const message = interaction.message;
  const oldEmbed = message.embeds[0];

  const editedEmbed = new EmbedBuilder()
    .setTitle(oldEmbed.title)
    .setDescription(oldEmbed.description)
    .setURL(oldEmbed.url)
    .setColor(confirmation == Actions.BLOCK ? config.visuals.red : config.visuals.green);

  notFound
    ? editedEmbed
        .setFooter({
          text: `${type === ModerationType.SPAM ? 'Spam' : 'N/A'} not found`
        })
        .setColor(config.visuals.red)
    : editedEmbed.setFooter({
        text: `${confirmation == Actions.BLOCK ? 'Blocked ' : 'Approved '} by ${
          interaction.user.username
        }`
      });

  return editedEmbed;
}

export function createModerationButtons(type: ModerationType, ipHash: string) {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${Actions.APPROVE}/${type}/${ipHash}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${Actions.BLOCK}/${type}/${ipHash}`)
      .setLabel('Block')
      .setStyle(ButtonStyle.Danger)
  );

  return actions;
}

function createConfirmationButtons(
  action: Actions,
  type: ModerationType,
  ipHash: string
): ActionRowBuilder<ButtonBuilder> {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${Actions.CONFIRM}/${type}/${ipHash}/${action}`)
      .setLabel(`Confirm ${action === Actions.BLOCK ? 'blocking' : 'approval'}`)
      .setStyle(action === Actions.BLOCK ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${Actions.CANCEL}/${type}/${ipHash}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return actions;
}
