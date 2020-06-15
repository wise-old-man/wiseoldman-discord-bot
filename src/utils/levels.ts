import { SkillResult } from '../api/types';

export const MAX_LEVEL = 99;
export const MAX_VIRTUAL_LEVEL = 126;

export function getLevel(experience: number, virtual = false): number {
  // Unranked
  if (experience === -1) {
    return 0;
  }

  const maxlevel = virtual ? MAX_VIRTUAL_LEVEL : MAX_LEVEL;

  let accumulated = 0;

  for (let level = 1; level < maxlevel; level++) {
    const required = getXpDifferenceTo(level + 1);

    if (experience >= accumulated && experience < accumulated + required) {
      return level;
    }

    accumulated += required;
  }

  return maxlevel;
}

export function getTotalLevel(skills: SkillResult[]): number {
  return skills
    .filter(skill => skill.name !== 'overall')
    .map(skill => getLevel(skill.experience))
    .reduce((acc, cur) => acc + cur, 0);
}

export function getExperienceAt(level: number): number {
  let accumulated = 0;

  for (let l = 1; l !== level + 1; l++) {
    accumulated += getXpDifferenceTo(l);
  }

  return accumulated;
}

function getXpDifferenceTo(level: number) {
  if (level < 2) {
    return 0;
  }

  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}
