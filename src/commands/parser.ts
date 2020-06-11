import config from '../config';

export function parseCommand(text: string) {
  if (!text.startsWith(config.prefix)) {
    throw new Error('Command does not start with a valid prefix.');
  }

  // Remove the prefix from the command text
  const commandBody = text.replace(config.prefix, '');

  // Split the command into its different sections
  const split = commandBody.split(' ').filter(s => s.length);

  if (split.length === 0) {
    throw new Error('Empty command.');
  }

  const primary = split[0];
  const options = split.slice(1, split.length);

  return { primary, options };
}
