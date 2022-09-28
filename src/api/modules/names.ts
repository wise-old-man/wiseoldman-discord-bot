import { getLevel } from '../../utils/levels';
import api from '../handler';
import { NameChange } from '../types';

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

export async function reviewNameChange(id: number): Promise<any> {
  const URL = `/names/${id}`;
  const { data } = await api.get(URL);

  const { isNewOnHiscores, hasNegativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats, newStats } =
    data.data;

  const expDiff = newStats && oldStats ? newStats.overall.experience - oldStats.overall.experience : 0;

  const oldTotalLevel = !oldStats
    ? 0
    : Object.keys(oldStats)
        .filter((k: any) => oldStats[k] && oldStats[k].experience && k !== 'overall')
        .map((k: any) => getLevel(oldStats[k].experience))
        .reduce((acc, curr) => acc + curr, 0);

  const newTotalLevel = !newStats
    ? 0
    : Object.keys(newStats)
        .filter((k: any) => newStats[k] && newStats[k].experience && k !== 'overall')
        .map((k: any) => getLevel(newStats[k].experience))
        .reduce((acc, curr) => acc + curr, 0);

  return {
    oldName: data.nameChange.oldName,
    newName: data.nameChange.newName,
    status: data.nameChange.status,
    isNewOnHiscores,
    hasNegativeGains,
    hoursDiff,
    ehpDiff,
    ehbDiff,
    expDiff,
    oldTotalLevel,
    newTotalLevel
  };
}
