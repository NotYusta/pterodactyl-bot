import { Client, GuildMemberRoleManager } from 'discord.js';
import { botCommands, registerCommands } from './commands';

export const registerEvents = (botClient: Client) => {
    botClient.on('ready', (client) => {
        console.log(`Logged in as ${client.user?.tag}!`);

        registerCommands(client);
    });

    botClient.on('interactionCreate', async (interaction) => {
        if (!interaction.member) return;

        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName;
            for (const command of botCommands) {
                if (command.builder.name === commandName) {
                    let isPermissioned = false;
                    const cmdRoles = command.roles;
                    const cmdUsers = command.users;
                    const memberRoles = interaction.member.roles;
                    if (cmdRoles && memberRoles instanceof GuildMemberRoleManager) {
                        isPermissioned = cmdRoles.some((role) => memberRoles.cache.has(role));
                    }

                    if (cmdUsers && cmdUsers.length > 0) {
                        isPermissioned = cmdUsers.includes(interaction.user.id);
                    }

                    if (!cmdRoles && !cmdUsers) {
                        isPermissioned = true;
                    }

                    if (!isPermissioned) {
                        await interaction.reply({
                            content: 'You do not have permission to run this command.',
                            ephemeral: true,
                        });

                        return;
                    }

                    await command.execute(interaction);
                }
            }
        }
    });
};
