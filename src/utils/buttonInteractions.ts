import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../config';
import {
  handlePatreonTrigger,
  PATREON_TRIGGER_ID,
  PATREON_LEAGUE_TRIGGER_ID,
  handlePatreonLeagueTrigger
} from '../patreon-trigger';
import { allowActions, blockActions } from '../services/wiseoldman';
import { CommandError } from './commands';

enum Actions {
  BLOCK = 'block',
  ALLOW = 'allow',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

export enum ModerationType {
  SPAM = 'spam'
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [action, type, ipHash, confirmation] = interaction.customId.split('/');

  if (action === PATREON_TRIGGER_ID) {
    handlePatreonTrigger(interaction);
  } else if (action === PATREON_LEAGUE_TRIGGER_ID) {
    handlePatreonLeagueTrigger(interaction);
  } else if (action === Actions.BLOCK || action === Actions.ALLOW) {
    await interaction.update({
      components: [createConfirmationButtons(action, type as ModerationType, ipHash)]
    });
  } else if (action === Actions.CONFIRM) {
    if (type === ModerationType.SPAM) {
      if (confirmation === Actions.BLOCK) {
        try {
          await blockActions(ipHash).catch(e => {
            throw new CommandError(e.message);
          });
        } catch (error) {
          await interaction.reply({ ephemeral: false, content: `${error}` });
          return;
        }
      } else if (confirmation === Actions.ALLOW) {
        try {
          await allowActions(ipHash).catch(e => {
            throw new CommandError(e.message);
          });
        } catch (error) {
          await interaction.reply({ ephemeral: false, content: `${error}` });
          return;
        }
      }
    }

    interaction.update({
      embeds: [await updateEmbed(confirmation, type, interaction)],
      components: []
    });
  } else if (action === Actions.CANCEL) {
    await interaction.update({
      components: [createModerationButtons(type as ModerationType, ipHash)]
    });
  }
}

async function updateEmbed(confirmation: string, type: string, interaction: ButtonInteraction) {
  const message = interaction.message;
  const oldEmbed = message.embeds[0];

  const editedEmbed = new EmbedBuilder()
    .setTitle(oldEmbed.title)
    .setDescription(oldEmbed.description)
    .setURL(oldEmbed.url)
    .setColor(confirmation == Actions.BLOCK ? config.visuals.red : config.visuals.green);

  editedEmbed.setFooter({
    text: `${confirmation == Actions.BLOCK ? 'Blocked ' : 'Allowed '} by ${interaction.user.username}`
  });

  return editedEmbed;
}

export function createModerationButtons(type: ModerationType, ipHash: string) {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${Actions.ALLOW}/${type}/${ipHash}`)
      .setLabel('Allow')
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
