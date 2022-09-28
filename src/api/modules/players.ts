import api from '../handler';

/**
 * Send an API request attempting to delete a player (and all its data)
 */
async function deletePlayer(username: string): Promise<{ message: string }> {
  const URL = `/players/${username}`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.delete(URL, { data: { adminPassword } });

  return data;
}

/**
 * Send an API request attempting to update a player's country
 */
async function updateCountry(username: string, country: string): Promise<{ message: string }> {
  const URL = `/players/${username}/country`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.put(URL, { country, adminPassword });

  return data;
}

export { updateCountry, deletePlayer };
