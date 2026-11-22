import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../config';
import { handlePatreonTrigger, PATREON_TRIGGER_ID } from '../patreon-trigger';
import { allowActions, archive, blockActions, forceUpdate, rollback } from '../services/wiseoldman';
import { CommandError } from './commands';

export enum Actions {
  BLOCK = 'block',
  ALLOW = 'allow',
  CONFIRM = 'confirm',
  CANCEL = 'cancel',
  NAME_TRANSFER = 'nametransfer',
  ROLLBACK = 'rollback',
  ALT_ROLLBACK = 'altrollback',
  DEIRONED = 'deironed',
  EXP_DUMP = 'expDump',
  IDK = 'idk'
}

export enum ModerationType {
  SPAM = 'spam',
  FLAGGED_REVIEW = 'flaggedreview'
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [type, action, ipHash, confirmation] = interaction.customId.split('/');

  if (type === PATREON_TRIGGER_ID) {
    handlePatreonTrigger(interaction);
  } else if (type === ModerationType.FLAGGED_REVIEW) {
    // Actions for reviewing flagged players
    await interaction.deferUpdate();

    const username = ipHash;
    const message = interaction.message;
    const oldEmbed = message.embeds[0];
    const interactionUser = interaction.member?.user.username;

    const newEmbed = new EmbedBuilder()
      .setTitle(oldEmbed.title)
      .setDescription(oldEmbed.description)
      .setURL(oldEmbed.url)
      .setColor(oldEmbed.color);

    if (action === Actions.IDK) {
      newEmbed
        .setColor(config.visuals.orange)
        .setFooter({ text: `Marked as "🤷‍♂️" by ${interactionUser}` });

      await interaction.editReply({ embeds: [newEmbed], components: [] });
      await interaction.followUp(`Paging <@329256344798494773>`);
      return;
    } else if (action === Actions.ROLLBACK) {
      try {
        await rollback(username, false);
        newEmbed.setColor(config.visuals.green).setFooter({ text: `Rolled back by ${interactionUser}` });
      } catch (error) {
        console.log(error);
        newEmbed.setColor(config.visuals.red).setFooter({ text: `Rollback failed` });
      }

      await interaction.editReply({ embeds: [newEmbed], components: [] });
      return;
    } else if (action === Actions.ALT_ROLLBACK) {
      try {
        await forceUpdate(username);
        newEmbed
          .setColor(config.visuals.green)
          .setFooter({ text: `Force updated by ${interactionUser}` });
      } catch (error) {
        console.log(error);
        newEmbed.setColor(config.visuals.red).setFooter({ text: `Force update failed` });
      }
      await interaction.editReply({ embeds: [newEmbed], components: [] });
      return;
    } else if (action === Actions.DEIRONED) {
      try {
        await handleRollback(username);
        newEmbed.setColor(config.visuals.green).setFooter({ text: `De-iron fix by ${interactionUser}` });
      } catch (error) {
        console.log(error);
        newEmbed.setColor(config.visuals.red).setFooter({ text: `De-iron fix failed` });
      }
      await interaction.editReply({ embeds: [newEmbed], components: [] });
      return;
    } else if (action === Actions.EXP_DUMP) {
      try {
        await forceUpdate(username);
        newEmbed
          .setColor(config.visuals.green)
          .setFooter({ text: `Force updated by ${interactionUser}` });
      } catch (error) {
        console.log(error);
        newEmbed.setColor(config.visuals.red).setFooter({ text: `Force update failed` });
      }
      await interaction.editReply({ embeds: [newEmbed], components: [] });
      return;
    } else if (action === Actions.NAME_TRANSFER) {
      try {
        const archivedPlayer = await archive(username);
        newEmbed.setColor(config.visuals.green).setFooter({
          text: `Archived by ${interactionUser} (archived username: ${archivedPlayer.username})`
        });
      } catch (error) {
        console.log(error);
        newEmbed.setColor(config.visuals.red).setFooter({ text: `Archive failed` });
      }
      await interaction.editReply({ embeds: [newEmbed], components: [] });
      return;
    }
  } else if (action === Actions.BLOCK || action === Actions.ALLOW) {
    await interaction.update({
      components: [createConfirmationButtons(type as ModerationType, action, ipHash)]
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
      embeds: [await updateEmbed(type, confirmation, interaction)],
      components: []
    });
  } else if (action === Actions.CANCEL) {
    await interaction.update({
      components: [createModerationButtons(type as ModerationType, ipHash)]
    });
  }
}

async function updateEmbed(type: string, confirmation: string, interaction: ButtonInteraction) {
  const message = interaction.message;
  const oldEmbed = message.embeds[0];

  const editedEmbed = new EmbedBuilder()
    .setTitle(oldEmbed.title)
    .setDescription(oldEmbed.description)
    .setURL(oldEmbed.url)
    .setColor(confirmation == Actions.BLOCK ? config.visuals.red : config.visuals.green);

  editedEmbed.setFooter({
    text: `${confirmation == Actions.BLOCK ? 'Blocked' : 'Allowed'} by ${interaction.user.username}`
  });

  return editedEmbed;
}

export function createModerationButtons(type: ModerationType, ipHash: string) {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${type}/${Actions.ALLOW}/${ipHash}`)
      .setLabel('Allow')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${type}/${Actions.BLOCK}/${ipHash}`)
      .setLabel('Block')
      .setStyle(ButtonStyle.Danger)
  );

  return actions;
}

function createConfirmationButtons(
  type: ModerationType,
  action: Actions,
  ipHash: string
): ActionRowBuilder<ButtonBuilder> {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${type}/${Actions.CONFIRM}/${ipHash}/${action}`)
      .setLabel(`Confirm ${action === Actions.BLOCK ? 'blocking' : 'approval'}`)
      .setStyle(action === Actions.BLOCK ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${type}/${Actions.CANCEL}/${ipHash}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return actions;
}

async function handleRollback(username: string) {
  // First, try to delete only the snapshots AFTER lastChangedAt, if that fails
  // try to delete the last snapshot (regardless of lastChangedAt date),
  // if both of those fail, then there's something wrong, just let it throw
  try {
    await rollback(username, true);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      error.message !== "Failed to delete a player's last snapshots."
    ) {
      throw error;
    }
  }

  await rollback(username, false);
}
