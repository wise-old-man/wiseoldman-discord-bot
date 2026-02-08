import { Country } from '@wise-old-man/utils';

// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397;

export function countryCodeEmoji(cc: Country | null): string {
  if (cc === null) return '🏳️';
  if (cc === Country.GB_SCT) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (cc === Country.GB_WLS) return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  if (cc === Country.GB_NIR) return '🇬🇧';
  if (cc === Country.GB_ENG) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';

  if (!/^[a-z]{2}$/i.test(cc)) {
    return '';
  }

  const codePoints = [...cc.toUpperCase()].map(c => (c.codePointAt(0) || 0) + OFFSET);
  return String.fromCodePoint(...codePoints);
}

export default countryCodeEmoji;
