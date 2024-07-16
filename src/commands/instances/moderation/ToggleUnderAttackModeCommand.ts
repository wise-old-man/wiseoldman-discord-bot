import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { toggleUnderAttackMode } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'toggle-under-attack-mode',
  description: 'Toggle "Under Attack Mode"',
  options: [
    {
      name: 'on',
      type: ApplicationCommandOptionType.Boolean,
      required: true,
      description: 'The state of the "Under Attack Mode" (true = ON)'
    }
  ]
};

class ToggleUnderAttackModeCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const state = interaction.options.getBoolean('on', false);

    if (state === null) {
      throw new CommandError(`Invalid boolean value.`);
    }

    const newState = await toggleUnderAttackMode(state).catch(e => {
      throw new CommandError('Failed to toggle "Under Attack Mode".');
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(
        `Under Attack Mode is now ${newState ? 'ON 🚨' : 'OFF ✅'} CC: <@329256344798494773>`
      );

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ToggleUnderAttackModeCommand();
