/**
 * Some API responses have dates as strings, this method is used
 * to convert those to real date instances.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function convertDates(data: any | any[], dateKeys: string[]): void {
  if (!data) {
    return;
  }

  // If is array, convert the dates on each element
  if (Array.isArray(data)) {
    data.forEach(d => {
      dateKeys.forEach(key => {
        if (d[key]) {
          d[key] = new Date(d[key]);
        }
      });
    });
  } else {
    dateKeys.forEach(key => {
      if (data[key]) {
        data[key] = new Date(data[key]);
      }
    });
  }
}
