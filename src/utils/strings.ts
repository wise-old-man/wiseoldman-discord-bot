export function encodeURL(url: string): string {
  return encodeURI(url.replace(/ /g, '_'));
}
