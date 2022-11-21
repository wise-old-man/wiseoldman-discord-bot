import { SlashCommandSubcommandBuilder } from '@discordjs/builders';

interface BaseOption {
  type: 'integer' | 'string';
  name: string;
  description: string;
  required?: boolean;
  autocomplete?: boolean;
}

interface IntegerOption extends BaseOption {
  type: 'integer';
  choices?: Array<{ value: number; label: string }>;
}

interface StringOption extends BaseOption {
  type: 'string';
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

          if (option.autocomplete) opt.setAutocomplete(true);
          if (option.required) opt.setRequired(true);

          if (option.choices && option.choices.length > 0) {
            opt.addChoices(option.choices.map(c => [c.label, c.value]));
          }

          return opt;
        });
      } else if (option.type === 'string') {
        command.addStringOption(opt => {
          opt.setName(option.name).setDescription(option.description);

          if (option.autocomplete) opt.setAutocomplete(true);
          if (option.required) opt.setRequired(true);

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
