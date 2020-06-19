import axios from 'axios';
import config from '../../config';
import { Player, PlayerAchievement, PlayerGained, PlayerRecord } from '../types';
import { convertDates } from '../utils';

/*
 * Fetch the player details from the API.
 */
async function fetchPlayer(username: string): Promise<Player> {
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
async function updatePlayer(username: string): Promise<Player> {
  const URL = `${config.baseAPIUrl}/players/track`;
  const { data } = await axios.post(URL, { username });

  // Convert date strings into date instances
  convertDates(data, ['registeredAt', 'updatedAt', 'lastImportedAt']);
  convertDates(data.latestSnapshot, ['createdAt', 'importedAt']);

  return data;
}

/**
 * Fetch the player's gains from the API.
 */
async function fetchPlayerGains(username: string, period: string): Promise<PlayerGained> {
  const URL = `${config.baseAPIUrl}/players/username/${username}/gained`;
  const { data } = await axios.get(URL, { params: { period } });

  // Convert date strings into date instances
  convertDates(data, ['startsAt', 'endsAt']);

  return data;
}

/**
 * Fetch the player's records from the API.
 */
async function fetchPlayerRecords(username: string, metric: string): Promise<PlayerRecord[]> {
  const URL = `${config.baseAPIUrl}/players/username/${username}/records`;
  const { data } = await axios.get(URL, { params: { metric } });

  // Convert date strings into date instances
  convertDates(data, ['updatedAt']);

  return data;
}

/**
 * Fetch the player's achievements from the API.
 */
async function fetchPlayerAchievements(username: string, limit = 5): Promise<PlayerAchievement[]> {
  const URL = `${config.baseAPIUrl}/players/username/${username}/achievements`;
  const { data } = await axios.get(URL);

  if (!data) {
    return [];
  }

  const achievements: PlayerAchievement[] = data;

  // Convert date strings into date instances
  convertDates(achievements, ['createdAt']);

  return achievements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export { fetchPlayer, updatePlayer, fetchPlayerGains, fetchPlayerRecords, fetchPlayerAchievements };
