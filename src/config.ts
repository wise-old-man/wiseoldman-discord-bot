import 'dotenv/config';

export default {
  token: process.env.DISCORD_TOKEN,
  defaultPrefix: '!',
  validPrefixes: ['!', '-', '+', '++', '$'],
  helpCommand: 'wom!help',
  baseAPIUrl: 'https://api.wiseoldman.net',
  //baseAPIUrl: 'http://localhost:5000/api',
  requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS'],
  visuals: {
    blue: 0x2980b9,
    red: 0xcc4242,
    green: 0x64d85b,
    orange: 0xecbf54
  },
  discord: {
    //guildId: '679454777708380161',
    guildId: '847787694213824512',
    //clientId: '719720369241718837',
    clientId: '738322594356264990',
    roles: {
      //moderator: '705821689526747136',
      moderator: '895280208075165757',
      //groupLeader: '705826389474934845'
      groupLeader: '895280353684647998'
    },
    channels: {
      //flags: '802680940835897384',
      flags: '895279970736308265',
      //leadersLog: '830199626630955039'
      leadersLog: '895279851555160135'
    }
  }
};
