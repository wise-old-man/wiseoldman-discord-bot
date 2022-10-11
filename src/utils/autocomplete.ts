import { getMetricName, METRICS, PeriodProps, PERIODS, CountryProps } from '@wise-old-man/utils';
import { customCommands } from '../commands/CustomCommands';

const PERIOD_OPTIONS = PERIODS.map(p => ({ name: PeriodProps[p].name, value: p }));

interface AutoCompleteOption {
  name: string;
  value: string;
}

function matches(currentValue: string, ...options: string[]) {
  return options.some(opt => opt.toLowerCase().includes(currentValue.toLowerCase()));
}

export function getCountryOptions(currentValue: string): AutoCompleteOption[] {
  if (!currentValue) return [];

  return Object.entries(CountryProps)
    .map(value => value[1])
    .filter(c => matches(currentValue, c.name, c.code))
    .map(c => ({
      name: c.name,
      value: c.code
    }));
}

export function getPeriodOptions(currentValue: string): AutoCompleteOption[] {
  return PERIOD_OPTIONS.filter(p => (!currentValue ? true : matches(currentValue, p.name, p.value)));
}

export function getMetricOptions(currentValue: string): AutoCompleteOption[] {
  return METRICS.filter(metric => (!currentValue ? true : matches(currentValue, metric))).map(
    metric => ({
      name: getMetricName(metric),
      value: metric
    })
  );
}

export function getHelpCategoryOptions(currentValue: string): AutoCompleteOption[] {
  return customCommands
    .filter(({ command }) => (!currentValue ? true : matches(currentValue, command)))
    .map(c => ({ name: c.name, value: c.command }));
}
