import { Client } from 'discord.js';
import { botCommands, registerCommands } from './commands';

export const registerEvents = (botClient: Client) => {
    botClient.on('ready', (client) => {
        console.log(`Logged in as ${client.user?.tag}!`);

        registerCommands(client);
    });

    botClient.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const commandName = interaction.commandName;

        for (const command of botCommands) {
            if (command.builder.name === commandName) {
                await command.execute(interaction);
            }
        }
    });
};
