import { NameChange } from '@wise-old-man/utils';
import api from '../handler';

export async function approve(id: number): Promise<NameChange> {
  const URL = `/names/${id}/approve`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.post(URL, { adminPassword });

  return data;
}

export async function deny(id: number): Promise<NameChange> {
  const URL = `/names/${id}/deny`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.post(URL, { adminPassword });

  return data;
}
