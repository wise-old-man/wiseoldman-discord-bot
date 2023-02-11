/**
 * This file has been created as a way to force any usage
 * of process.env to go through a dotenv.config first.
 */
import 'dotenv/config';

function parseTemplate(originTemplate: string) {
  if (!originTemplate) return originTemplate;
  return originTemplate.replace(/{([^{}]+)}/g, (_, key) => process.env[key]).replace(/\$/g, '');
}

process.env.BOT_DATABASE_URL = parseTemplate(process.env.BOT_DATABASE_URL);

export default process.env;
