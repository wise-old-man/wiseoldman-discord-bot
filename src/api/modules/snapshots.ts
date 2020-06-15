import { mapValues } from 'lodash';
import { getLevel, getTotalLevel, getType } from '../../utils';
import { MetricResult, MetricType, Snapshot } from '../types';

/**
 * Converts a snapshot object (from API) to an array of metric results
 */
export function toResults(snapshot: Snapshot, type?: MetricType): MetricResult[] {
  const results = Object.values(
    mapValues(snapshot, (val: any, key) => {
      return val ? { name: key, type: getType(key), ...val } : null;
    })
  ).filter(r => r && (!type || r.type === type));

  // If it's skill results, add the level field
  if (type === MetricType.Skill) {
    // Calculate the total level from the skill results
    const totalLevel = getTotalLevel(results);
    // Add the level field to each skill result
    results.forEach(r => (r.level = r.name === 'overall' ? totalLevel : getLevel(r.experience)));
  }

  return results;
}
