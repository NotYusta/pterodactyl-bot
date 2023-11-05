import { SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../typings/bot';

export const pingCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.reply('Pong!');
    },
    build: (commandBuilder) => {
        return commandBuilder;
    },
};
