import axios from 'axios';
import config from '../../config';
import { Player } from '../types';
import { convertDates } from '../utils';

/*
 * Fetch the player details from the API.
 */
export async function fetchPlayer(username: string): Promise<Player> {
  const URL = `${config.baseAPIUrl}/players/username/${username}`;
  const { data } = await axios.get(URL);

  // Convert date strings into date instances
  convertDates(data, ['registeredAt', 'updatedAt', 'lastImportedAt']);
  convertDates(data.latestSnapshot, ['createdAt', 'importedAt']);

  return data;
}

/**
 * Send an API request attempting to update a given username.
 */
export async function updatePlayer(username: string): Promise<Player> {
  const URL = `${config.baseAPIUrl}/players/track`;
  const { data } = await axios.post(URL, { username });

  // Convert date strings into date instances
  convertDates(data, ['registeredAt', 'updatedAt', 'lastImportedAt']);
  convertDates(data.latestSnapshot, ['createdAt', 'importedAt']);

  return data;
}
