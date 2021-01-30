// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397;

export function countryCodeEmoji(cc: string): string {
  if (cc === 'USA') return countryCodeEmoji('US');
  if (cc === 'UK') return countryCodeEmoji('GB');

  if (!/^[a-z]{2}$/i.test(cc)) {
    return '';
  }

  const codePoints = [...cc.toUpperCase()].map(c => (c.codePointAt(0) || 0) + OFFSET);
  return String.fromCodePoint(...codePoints);
}

export function emojiCountryCode(flag: string): string {
  if (flag.length !== 4) {
    return '';
  }

  const codePoints = [...flag].map(c => (c.codePointAt(0) || 0) - OFFSET);
  return String.fromCodePoint(...codePoints);
}

export default countryCodeEmoji;
