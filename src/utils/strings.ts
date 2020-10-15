// Source: https://github.com/gc/oldschooljs/blob/master/src/util/util.ts
/**
 * Example: 356 688 847
 * Decimal precision of 1 = 356.7
 * Decimal precision of 2 = 356.69
 */
export function toKMB(number: number, decimalPrecision = 2): string {
  if (number > 999999999 || number < -999999999) {
    return round(number / 1000000000, decimalPrecision) + 'b';
  } else if (number > 999999 || number < -999999) {
    return round(number / 1000000, decimalPrecision) + 'm';
  } else if (number > 999 || number < -999) {
    return round(number / 1000, decimalPrecision) + 'k';
  } else {
    return round(number, decimalPrecision);
  }
}

export function round(number: number, cases: number): string {
  const precision = Math.pow(10, cases);
  return (Math.round(number * precision) / precision).toString();
}

export function encodeURL(url: string): string {
  return encodeURI(url.replace(/ /g, '_'));
}
