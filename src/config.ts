import 'dotenv/config';

export default {
  token: process.env.DISCORD_TOKEN,
  defaultPrefix: '!',
  validPrefixes: ['!', '-', '+', '++', '$'],
  baseAPIUrl: 'https://wiseoldman.net/api',
  visuals: {
    blue: '#2980b9',
    red: '#cc4242',
    green: '#64d85b',
    orange: '#ecbf54'
  }
};
