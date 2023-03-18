import { Client, MessageEmbed, TextChannel } from 'discord.js';
import {
  Boss,
  BOSSES,
  formatNumber,
  FormattedSnapshot,
  Metric,
  MetricProps,
  Player,
  REAL_SKILLS,
  Skill
} from '@wise-old-man/utils';
import { Event } from '../../utils/events';
import config from '../../config';

const STACKABLE_EXP_SKILLS = [
  Metric.COOKING,
  Metric.CRAFTING,
  Metric.SMITHING,
  Metric.AGILITY,
  Metric.THIEVING
];

interface PlayerFlaggedData {
  player: Player;
  previousSnapshot: FormattedSnapshot;
  rejectedSnapshot: FormattedSnapshot;
  negativeGains: boolean;
  excessiveGains: boolean;
  excessiveGainsReversed: boolean;
}

class PlayerFlagged implements Event {
  type: string;

  constructor() {
    this.type = 'PLAYER_FLAGGED';
  }

  async execute(data: PlayerFlaggedData, client: Client) {
    const { player, previousSnapshot: previous, rejectedSnapshot: rejected } = data;

    const timeDiff = new Date(rejected.createdAt).getTime() - new Date(previous.createdAt).getTime();

    const previousEHB = BOSSES.map(b => previous.data.bosses[b].ehb).reduce((a, b) => a + b, 0);
    const rejectedEHB = BOSSES.map(b => rejected.data.bosses[b].ehb).reduce((a, b) => a + b, 0);

    const ehpDiff = rejected.data.skills.overall.ehp - previous.data.skills.overall.ehp;
    const ehbDiff = rejectedEHB - previousEHB;

    const ehpChange = Math.round((ehpDiff / rejected.data.skills.overall.ehp) * 100);
    const ehbChange = Math.round((ehbDiff / rejectedEHB) * 100);

    const lines = [];

    if (data.negativeGains) {
      lines.push(`**Main cause**: Negative gains`);
      lines.push(`**Time diff**: ${Math.floor(timeDiff / 1000 / 60 / 60)} hours`);

      // if lost too much exp, it's most likely not a rollback
      if (data.excessiveGainsReversed) {
        lines.push(`\n**🤔 Prediction 🤔**\n Name transfer`);
      } else {
        lines.push(`\n**🤔 Prediction 🤔**\n Hiscores rollback (rare) or Name transfer (common)`);
      }

      lines.push('\n');
      lines.push(`**EHP diff**: ${Math.round(ehpDiff)} (${ehpChange}%)`);
      lines.push(`**EHB diff**: ${Math.round(ehbDiff)} (${ehbChange}%)`);
    } else if (data.excessiveGains) {
      // Sum the gained EHP from all stackable skills
      const gainedEHPFromStackableSkills = STACKABLE_EXP_SKILLS.map(
        s => rejected.data.skills[s].ehp - previous.data.skills[s].ehp
      ).reduce((a, b) => a + b, 0);

      const stackableGainedRatio = gainedEHPFromStackableSkills / (ehpDiff + ehbDiff);

      const previousRank = previous.data.skills.overall.rank;
      const rejectedRank = rejected.data.skills.overall.rank;

      const previousExp = previous.data.skills.overall.experience;
      const rejectedExp = rejected.data.skills.overall.experience;

      const rankChange = 1 - previousRank / rejectedRank;
      const expChange = 1 - previousExp / rejectedExp;

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

      lines.push('\n');
      lines.push(`**EHP diff**: ${Math.round(ehpDiff)} (\`${Math.max(0, ehpChange)}%\`)`);
      lines.push(`**EHB diff**: ${Math.round(ehbDiff)} (\`${Math.max(0, ehbChange)}%\`)`);

      lines.push('\n');

      lines.push(
        [
          `Stackable skill gains: \`${Math.round(stackableGainedRatio * 100)}%\``,
          stackableGainedRatio > 0.7 ? '(`> 70%`)' : ''
        ].join(' ')
      );

      lines.push(
        [
          `Exp change: \`${formatNumber(previousExp, true)}\` -> \`${formatNumber(rejectedExp, true)}\``,
          `(\`${Math.round(expChange * 100)}%\`)`
        ].join(' ')
      );

      lines.push(
        [
          `Rank change: \`${formatNumber(previousRank)}\` -> \`${formatNumber(rejectedRank)}\``,
          `(\`${Math.round(rankChange * 100)}%\`)`
        ].join(' ')
      );
    }

    lines.push(...getLargestSkillChanges(previous, rejected));
    lines.push(...getLargestBossChanges(previous, rejected));

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`"${player.displayName}" flagged for review`)
      .setDescription(lines.join('\n'));

    await sendReviewMessage(message, client);
  }
}

function sendReviewMessage(message: MessageEmbed, client: Client) {
  const reviewChannel = client.channels?.cache.get(config.discord.channels.flaggedPlayerReviews);

  if (!reviewChannel) return;
  if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(reviewChannel)) return;

  return reviewChannel.send({ embeds: [message] });
}

function getLargestSkillChanges(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const lines = [];

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
    lines.push(`**Skill gains:**`);
    lines.push(...biggestGains.map(g => `${MetricProps[g[0]].name}: \`+${formatNumber(g[1], true)}\``));
  }

  if (biggestLosses.length > 0) {
    lines.push('\n');
    lines.push(`**Skill losses:**`);
    lines.push(...biggestLosses.map(l => `${MetricProps[l[0]].name}: \`${formatNumber(l[1], true)}\``));
  }

  return lines;
}

function getLargestBossChanges(previous: FormattedSnapshot, rejected: FormattedSnapshot) {
  const lines = [];

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
    lines.push(`**Boss gains:**`);
    lines.push(...biggestGains.map(g => `${MetricProps[g[0]].name}: \`+${formatNumber(g[1], true)}\``));
  }

  if (biggestLosses.length > 0) {
    lines.push('\n');
    lines.push(`**Boss losses:**`);
    lines.push(...biggestLosses.map(l => `${MetricProps[l[0]].name}: \`${formatNumber(l[1], true)}\``));
  }

  return lines;
}

export default new PlayerFlagged();
