import { customCommands } from '../commands/CustomCommands';
import { COUNTRIES } from './countries';
import { ALL_METRICS } from './metrics';

const PERIOD_OPTIONS = [
  { name: '5 Min', value: 'five_min' },
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Year', value: 'year' }
];

interface AutoCompleteOption {
  name: string;
  value: string;
}

function matches(currentValue: string, ...options: string[]) {
  return options.some(opt => opt.toLowerCase().includes(currentValue.toLowerCase()));
}

export function getCountryOptions(currentValue: string): AutoCompleteOption[] {
  if (!currentValue) return [];

  return COUNTRIES.filter(c => matches(currentValue, c.name, c.code)).map(c => ({
    name: c.name,
    value: c.code
  }));
}

export function getPeriodOptions(currentValue: string): AutoCompleteOption[] {
  return PERIOD_OPTIONS.filter(p => (!currentValue ? true : matches(currentValue, p.name, p.value)));
}

export function getMetricOptions(currentValue: string): AutoCompleteOption[] {
  return ALL_METRICS.filter(m => (!currentValue ? true : matches(currentValue, m.name, m.key))).map(
    m => ({
      name: m.name,
      value: m.key
    })
  );
}

export function getHelpCategoryOptions(currentValue: string): AutoCompleteOption[] {
  return customCommands
    .filter(({ command }) => (!currentValue ? true : matches(currentValue, command)))
    .map(c => ({ name: c.name, value: c.command }));
}
