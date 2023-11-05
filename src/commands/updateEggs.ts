import { SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { updatePteroEggs, pteroEggs } from '../utils';

export const updateEggsCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply('Updating eggs...');

        const currentLength = pteroEggs.length;
        await updatePteroEggs();
        await interaction.editReply(`Updated egg with a total of ${pteroEggs.length} from ${currentLength} eggs`);
    },
    build: (commandBuilder) => {
        return commandBuilder;
    },
};
