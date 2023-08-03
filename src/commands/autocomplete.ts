import { CountryProps, getMetricName, METRICS, PeriodProps, PERIODS } from '@wise-old-man/utils';
import { CUSTOM_COMMANDS } from './custom';

interface AutoCompleteOption {
  name: string;
  value: string;
}

function matches(currentValue: string, ...options: string[]) {
  return options.some(opt => opt.toLowerCase().includes(currentValue.toLowerCase()));
}

export function getCountryOptions(currentValue: string): AutoCompleteOption[] {
  if (!currentValue) return Object.entries(CountryProps).slice(0,24);

  return Object.entries(CountryProps)
    .map(value => value[1])
    .filter(c => matches(currentValue, c.name, c.code))
    .map(c => ({ name: c.name, value: c.code }));
}

export function getPeriodOptions(currentValue: string): AutoCompleteOption[] {
  return PERIODS.filter(p => (!currentValue ? true : matches(currentValue, p))).map(p => ({
    name: PeriodProps[p].name,
    value: p
  }));
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
  return CUSTOM_COMMANDS.filter(c => (!currentValue ? true : matches(currentValue, c.command))).map(
    c => ({ name: c.name, value: c.command })
  );
}
