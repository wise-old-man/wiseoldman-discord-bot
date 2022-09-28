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

function getXpDifferenceTo(level: number) {
  if (level < 2) {
    return 0;
  }

  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}
