import axios from 'axios';
import config from '../../config';
import {
  Competition,
  Group,
  GroupGainedEntry,
  GroupHiscoresEntry,
  GroupRecordEntry,
  Player
} from '../types';
import { convertDates } from '../utils';

/**
 * Fetch the group details from the API.
 */
async function fetchGroupDetails(id: number): Promise<Group> {
  const URL = `${config.baseAPIUrl}/groups/${id}`;
  const { data } = await axios.get(URL);

  // Convert date strings into date instances
  convertDates(data, ['createdAt', 'updatedAt']);

  return data;
}

/**
 * Fetch the group members from the API.
 */
async function fetchGroupMembers(id: number): Promise<Player[]> {
  const URL = `${config.baseAPIUrl}/groups/${id}/members`;
  const { data } = await axios.get(URL);

  return data;
}

/**
 * Fetch all group competitions from the API.
 */
async function fetchGroupCompetitions(id: number): Promise<Competition[]> {
  const URL = `${config.baseAPIUrl}/groups/${id}/competitions`;
  const { data } = await axios.get(URL);

  // Convert date strings into date instances
  convertDates(data, ['createdAt', 'updatedAt', 'startsAt', 'endsAt']);

  return data;
}

/**
 * Fetch group hiscores from the API.
 */
async function fetchGroupHiscores(id: number, metric: string): Promise<GroupHiscoresEntry[]> {
  const URL = `${config.baseAPIUrl}/groups/${id}/hiscores`;
  const params = { metric: metric.toLowerCase(), limit: 21 };
  const { data } = await axios.get(URL, { params });

  // Convert date strings into date instances
  convertDates(data, ['lastImportedAt', 'registeredAt', 'updatedAt']);

  return data;
}

/**
 * Fetch group gains from the API.
 */
async function fetchGroupGained(
  id: number,
  period: string,
  metric: string
): Promise<GroupGainedEntry[]> {
  const URL = `${config.baseAPIUrl}/groups/${id}/gained`;
  const params = { metric: metric.toLowerCase(), period: period.toLowerCase() };
  const { data } = await axios.get(URL, { params });

  // Convert date strings into date instances
  convertDates(data, ['startDate', 'endDate']);

  return data;
}

/**
 * Fetch group records from the API.
 */
async function fetchGroupRecords(
  id: number,
  period: string,
  metric: string
): Promise<GroupRecordEntry[]> {
  const URL = `${config.baseAPIUrl}/groups/${id}/records`;
  const params = { metric: metric.toLowerCase(), period: period.toLowerCase(), limit: 21 };
  const { data } = await axios.get(URL, { params });

  // Convert date strings into date instances
  convertDates(data, ['updatedAt']);

  return data;
}

export {
  fetchGroupDetails,
  fetchGroupMembers,
  fetchGroupCompetitions,
  fetchGroupHiscores,
  fetchGroupGained,
  fetchGroupRecords
};
