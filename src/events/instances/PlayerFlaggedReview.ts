import { Client, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import {
  Boss,
  BOSSES,
  formatNumber,
  FormattedSnapshot,
  MetricProps,
  Player,
  REAL_SKILLS,
  Skill
} from '@wise-old-man/utils';
import { encodeURL } from '../../utils';
import { Event } from '../../utils/events';
import config from '../../config';
import { archive, forceUpdate, rollback } from '../../services/wiseoldman';

interface PlayerFlaggedData {
  player: Player;
  flagContext: {
    previous: FormattedSnapshot;
    rejected: FormattedSnapshot;
    negativeGains: boolean;
    excessiveGains: boolean;
    possibleRollback: boolean;
    excessiveGainsReversed: boolean;
    data: {
      stackableGainedRatio: number;
      previousEHP: number;
      previousEHB: number;
      previousRank: number;
      rejectedEHP: number;
      rejectedEHB: number;
      rejectedRank: number;
    };
  };
}

class PlayerFlaggedReview implements Event {
  type: string;

  constructor() {
    this.type = 'PLAYER_FLAGGED_REVIEW';
  }

  async execute(data: PlayerFlaggedData, client: Client) {
    const { player, flagContext } = data;
    const { previous, rejected, possibleRollback, negativeGains, excessiveGains } = flagContext;

    const {
      previousEHP,
      previousEHB,
      previousRank,
      rejectedEHP,
      rejectedEHB,
      rejectedRank,
      stackableGainedRatio
    } = flagContext.data;

    const ehpDiff = rejectedEHP - previousEHP;
    const ehbDiff = rejectedEHB - previousEHB;

    const ehpChange = Math.round(getPercentageIncrease(previousEHP, rejectedEHP) * 100);
    const ehbChange = Math.round(getPercentageIncrease(previousEHB, rejectedEHB) * 100);

    const uniqueId = `${player.id}_${rejected.createdAt}`;
    const actions = new MessageActionRow();

    const timeDiff = new Date(rejected.createdAt).getTime() - new Date(previous.createdAt).getTime();

    const lines: string[] = [];

    if (negativeGains) {
      lines.push(`**Main cause**: Negative gains`);
      lines.push(`**Time diff**: ${Math.floor(timeDiff / 1000 / 60 / 60)} hours`);

      if (possibleRollback) {
        lines.push(`\n**🤔 Prediction 🤔**\n Name transfer (common) or Hiscores rollback (rare)`);
      } else {
        lines.push(`\n**🤔 Prediction 🤔**\n Name transfer`);
      }

      actions.addComponents(
        new MessageButton()
          .setCustomId(`name_transfer/${uniqueId}`)
          .setLabel('Name Transfer')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId(`rollback/${uniqueId}`)
          .setLabel('Hiscores Rollback')
          .setStyle('SECONDARY')
      );

      lines.push('\n');
      lines.push('**EHP**');

      lines.push(
        [
          `\`${formatNumber(previousEHP, false, 3)}\` -> \`${formatNumber(rejectedEHP, false, 3)}\``,
          `\`${formatNumber(ehpDiff, false, 3)}\` (\`${ehpChange}%\`)`
        ].join(' · ')
      );

      lines.push('**EHB**');

      lines.push(
        [
          `\`${formatNumber(previousEHB, false, 3)}\` -> \`${formatNumber(rejectedEHB, false, 3)}\``,
          `\`${formatNumber(ehbDiff, false, 3)}\` (\`${ehbChange}%\`)`
        ].join(' · ')
      );
    } else if (excessiveGains) {
      const previousExp = previous.data.skills.overall.experience;
      const rejectedExp = rejected.data.skills.overall.experience;

      const rankChange = getPercentageIncrease(previousRank, rejectedRank);
      const expChange = getPercentageIncrease(previousExp, rejectedExp);

      lines.push(`**Main cause**: Excessive gains`);
      lines.push(`**Time diff**: ${Math.floor(timeDiff / 1000 / 60 / 60)} hours`);

      if (stackableGainedRatio > 0.7) {
        // If most of the gained EHP+EHB is in stackable skills, it's probably a large exp dump
        lines.push(`\n**🤔 Prediction 🤔**\n Stackable exp dump`);
      } else if (rankChange > expChange && rankChange - expChange > 0.5) {
        // If the difference between rank and exp change is large, it's probably a de-ironed player (plummeted in rank)
        lines.push(`\n**🤔 Prediction 🤔**\n De-ironed`);
      } else {
        lines.push(`\n**🤔 Prediction 🤔**\n Name transfer`);
      }

      actions.addComponents(
        new MessageButton()
          .setCustomId(`name_transfer/${uniqueId}`)
          .setLabel('Name Transfer')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId(`deironed/${uniqueId}`)
          .setLabel('De-ironed')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId(`exp_dump/${uniqueId}`)
          .setLabel('Stackable Exp Dump')
          .setStyle('SECONDARY')
      );

      lines.push('\n');
      lines.push('**EHP**');

      lines.push(
        [
          `\`${formatNumber(previousEHP, false, 3)}\` -> \`${formatNumber(rejectedEHP, false, 3)}\``,
          `\`${formatNumber(ehpDiff, false, 3)}\` (\`${ehpChange}%\`)`
        ].join(' · ')
      );

      lines.push('**EHB**');

      lines.push(
        [
          `\`${formatNumber(previousEHB, false, 3)}\` -> \`${formatNumber(rejectedEHB, false, 3)}\``,
          `\`${formatNumber(ehbDiff, false, 3)}\` (\`${ehbChange}%\`)`
        ].join(' · ')
      );

      lines.push('\n');

      lines.push(
        [
          `Stackable skill gains: \`${Math.round(stackableGainedRatio * 100)}%\``,
          stackableGainedRatio > 0.7 ? '(`> 70%` ⚠️)' : ''
        ].join(' ')
      );

      lines.push(
        [
          `Exp change: \`${formatNumber(previousExp, true)}\` -> \`${formatNumber(rejectedExp, true)}\``,
          `(\`${Math.round(getPercentageIncrease(previousExp, rejectedExp) * 100)}%\`)`
        ].join(' ')
      );

      lines.push(
        [
          `Rank change: \`${formatNumber(previousRank)}\` -> \`${formatNumber(rejectedRank)}\``,
          `(\`${Math.round(getPercentageIncrease(previousRank, rejectedRank) * 100)}%\`)`
        ].join(' ')
      );
    }

    lines.push(...getLargestSkillChanges(previous, rejected));
    lines.push(...getLargestBossChanges(previous, rejected));

    actions.addComponents(
      new MessageButton()
        .setCustomId(`idk/${uniqueId}`)
        .setLabel("I'm not sure  🤷‍♂️")
        .setStyle('SECONDARY')
    );

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setTitle(`"${player.displayName}" flagged for review`)
      .setDescription(lines.join('\n'));

    const reviewChannel = client.channels?.cache.get(config.discord.channels.flaggedPlayerReviews);

    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(reviewChannel)) return;

    const reportMessage = await reviewChannel.send({
      embeds: [message],
      components: [actions]
    });

    reviewChannel
      .createMessageComponentCollector({ componentType: 'BUTTON', max: 1, time: 3600 * 1000 })
      .on('end', async collection => {
        if (!collection) return;

        const first = collection.first();
        if (!first) return;

        const username = first.member?.user.username;
        if (!username) return;

        const clickedId = first.customId;

        if (clickedId === `idk/${uniqueId}`) {
          message.setColor(config.visuals.orange).setFooter({ text: `Marked as "🤷‍♂️" by ${username}` });
          await reportMessage.edit({ embeds: [message], components: [] });
          await reportMessage.reply(`Paging <@329256344798494773>`);
          return;
        }

        if (clickedId === `rollback/${uniqueId}`) {
          try {
            await rollback(player.username, false);
            message.setColor(config.visuals.green).setFooter({ text: `Rolled back by ${username}` });
          } catch (error) {
            message.setColor(config.visuals.red).setFooter({ text: `Rollback failed` });
          }

          await reportMessage.edit({ embeds: [message], components: [] });
          return;
        }

        if (clickedId === `deironed/${uniqueId}`) {
          try {
            await rollback(player.username, true);
            message.setColor(config.visuals.green).setFooter({ text: `De-iron fix by ${username}` });
          } catch (error) {
            message.setColor(config.visuals.red).setFooter({ text: `De-iron fix failed` });
          }
          await reportMessage.edit({ embeds: [message], components: [] });
          return;
        }

        if (clickedId === `exp_dump/${uniqueId}`) {
          try {
            await forceUpdate(player.username);
            message.setColor(config.visuals.green).setFooter({ text: `Force updated by ${username}` });
          } catch (error) {
            message.setColor(config.visuals.red).setFooter({ text: `Force update failed` });
          }
          await reportMessage.edit({ embeds: [message], components: [] });
          return;
        }

        if (clickedId === `name_transfer/${uniqueId}`) {
          try {
            const archivedPlayer = await archive(player.username);
            message.setColor(config.visuals.green).setFooter({
              text: `Archived by ${username} (archived username: ${archivedPlayer.username})`
            });
          } catch (error) {
            message.setColor(config.visuals.red).setFooter({ text: `Archive failed` });
          }
          await reportMessage.edit({ embeds: [message], components: [] });
          return;
        }
      });
  }
}

function getLargestSkillChanges(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const lines: string[] = [];

  const map = new Map<Skill, number>();

  REAL_SKILLS.map(s => {
    map.set(
      s,
      Math.max(0, rejected.data.skills[s].experience) - Math.max(0, previous.data.skills[s].experience)
    );
  });

  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  const biggestGains = entries.slice(0, 3).filter(v => v[1] > 0);

  const biggestLosses = entries
    .slice(entries.length - 3, entries.length)
    .reverse()
    .filter(v => v[1] < 0);

  if (biggestGains.length > 0) {
    lines.push('\n');
    lines.push(`**Top Skill gains**`);
    lines.push(...biggestGains.map(g => `${MetricProps[g[0]].name}: \`+${formatNumber(g[1], true)}\``));
  }

  if (biggestLosses.length > 0) {
    lines.push('\n');
    lines.push(`**🔻 Top Skill losses🔻**`);
    lines.push(...biggestLosses.map(l => `${MetricProps[l[0]].name}: \`${formatNumber(l[1], true)}\``));
  }

  return lines;
}

function getLargestBossChanges(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const lines: string[] = [];

  const map = new Map<Boss, number>();

  BOSSES.map(b => {
    map.set(b, Math.max(0, rejected.data.bosses[b].kills) - Math.max(0, previous.data.bosses[b].kills));
  });

  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  const biggestGains = entries.slice(0, 3).filter(v => v[1] > 0);

  const biggestLosses = entries
    .slice(entries.length - 3, entries.length)
    .reverse()
    .filter(v => v[1] < 0);

  if (biggestGains.length > 0) {
    lines.push('\n');
    lines.push(`**Top Boss gains**`);
    lines.push(...biggestGains.map(g => `${MetricProps[g[0]].name}: \`+${formatNumber(g[1], true)}\``));
  }

  if (biggestLosses.length > 0) {
    lines.push('\n');
    lines.push(`**🔻 Top Boss losses 🔻**`);
    lines.push(...biggestLosses.map(l => `${MetricProps[l[0]].name}: \`${formatNumber(l[1], true)}\``));
  }

  return lines;
}

function getPercentageIncrease(previous: number, current: number) {
  if (previous === 0) return 0;

  return (current - previous) / previous;
}

export default new PlayerFlaggedReview();
