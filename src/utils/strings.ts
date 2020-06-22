// Source: https://github.com/gc/oldschooljs/blob/master/src/util/util.ts
/**
 * Example: 356 688 847
 * Decimal precision of 1 = 356.7
 * Decimal precision of 2 = 356.69
 */
export function toKMB(number: number, decimalPrecision = 2): string {
  function round(number: number): string {
    const precision = Math.pow(10, decimalPrecision);
    return (Math.round(number * precision) / precision).toString();
  }

  if (number > 999999999 || number < -999999999) {
    return round(number / 1000000000) + 'b';
  } else if (number > 999999 || number < -999999) {
    return round(number / 1000000) + 'm';
  } else if (number > 999 || number < -999) {
    return round(number / 1000) + 'k';
  } else {
    return round(number);
  }
}
