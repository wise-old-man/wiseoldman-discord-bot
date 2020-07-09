import { Alias } from '../';

/**
 * Find the "alias" username for a given discord userId.
 */
async function getUsername(userId: string | undefined): Promise<string | undefined | null> {
  if (!userId) return null;

  const alias = await Alias.findOne({ where: { userId } });

  return alias?.username;
}

/**
 * Find the "alias" userId for a given username.
 */
async function getUserId(username: string | undefined): Promise<string | undefined | null> {
  if (!username) return null;

  const alias = await Alias.findOne({ where: { username } });

  return alias?.userId;
}

/**
 * Update the "alias" username for a given discord userId.
 */
async function updateUsername(userId: string, username: string): Promise<Alias> {
  if (!userId) {
    throw new Error('Invalid userId.');
  }

  if (!username) {
    throw new Error('Invalid username.');
  }

  const alias = await Alias.findOne({ where: { userId } });

  // User already has a registered alias, update it.
  if (alias) {
    return await alias.setUsername(username);
  }

  // User is setting an alias for the first time.

  return await Alias.create({ userId, username });
}

export { getUserId, getUsername, updateUsername };
