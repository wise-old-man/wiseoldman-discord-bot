import { mapValues } from 'lodash';
import { MetricResult, MetricType } from '../types';
import { getType } from './metrics';

/**
 * Converts a snapshot object (from API) to an array of metric results
 */
export function toResults(snapshot: Object, type?: MetricType): MetricResult[] {
  const results = Object.values(
    mapValues(snapshot, (val: any, key) => {
      if (!val) {
        return null;
      }

      return { name: key, type: getType(key), ...val };
    })
  ).filter(r => r && (!type || r.type === type));

  return results;
}
