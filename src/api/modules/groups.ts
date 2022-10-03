import { GroupDetails } from '@wise-old-man/utils';
import api from '../handler';

/**
 * Send an API request attempting to reset a group's verification code.
 */
async function resetCode(groupId: number): Promise<{ newCode: string }> {
  const URL = `/groups/${groupId}/reset-code`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.put(URL, { adminPassword });

  return data;
}

/**
 * Send an API request attempting to verify a group.
 */
async function verify(groupId: number): Promise<GroupDetails> {
  const URL = `/groups/${groupId}/verify`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.put(URL, { adminPassword });

  return data;
}

export { resetCode, verify };
