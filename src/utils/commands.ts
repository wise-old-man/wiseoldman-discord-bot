import { SlashCommandSubcommandBuilder } from '@discordjs/builders';

interface IntegerOption {
  type: 'integer';
  name: string;
  description: string;
  choices?: Array<{ value: number; label: string }>;
}

interface StringOption {
  type: 'string';
  name: string;
  description: string;
  choices?: Array<{ value: string; label: string }>;
}

export interface CommandConfig {
  name: string;
  description: string;
  options?: Array<IntegerOption | StringOption>;
}

export function setupCommand(config: CommandConfig) {
  const command = new SlashCommandSubcommandBuilder()
    .setName(config.name)
    .setDescription(config.description);

  if (config.options) {
    config.options.forEach(option => {
      if (option.type === 'integer') {
        command.addIntegerOption(opt => {
          opt.setName(option.name).setDescription(option.description);

          if (option.choices && option.choices.length > 0) {
            opt.addChoices(option.choices.map(c => [c.label, c.value]));
          }

          return opt;
        });
      } else if (option.type === 'string') {
        command.addStringOption(opt => {
          opt.setName(option.name).setDescription(option.description);

          if (option.choices && option.choices.length > 0) {
            opt.addChoices(option.choices.map(c => [c.label, c.value]));
          }

          return opt;
        });
      }
    });
  }

  return command;
}
