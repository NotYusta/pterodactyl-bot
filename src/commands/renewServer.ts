import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { updateExpiryDataByServerId } from '../utils';

export const renewCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.deferReply();
        await interaction.editReply('Renewing server...');

        const serverIdentifier = interaction.options.getString('identifier', true);
        const days = interaction.options.getInteger('days', true);

        if (days > 1000) {
            await interaction.editReply('Days cannot be greater than 1000');
            return;
        }

        if (days < 1) {
            await interaction.editReply('Days cannot be less than 1');
            return;
        }
        updateExpiryDataByServerId(serverIdentifier, days);
        await interaction.editReply(`Renewed server ${serverIdentifier} for ${days} days`);
    },
    build: (commandBuilder) => {
        commandBuilder.setName('renew-server');
        commandBuilder.setDescription('Renew a server');

        const serverIdentifierOption = new SlashCommandStringOption();
        serverIdentifierOption.setName('identifier');
        serverIdentifierOption.setDescription('The Identifier of the server');
        serverIdentifierOption.setRequired(true);

        const daysOption = new SlashCommandIntegerOption();
        daysOption.setName('days');
        daysOption.setDescription('The amount of days to add');
        daysOption.setRequired(true);

        commandBuilder.addStringOption(serverIdentifierOption);
        commandBuilder.addIntegerOption(daysOption);
        return commandBuilder;
    },
};
