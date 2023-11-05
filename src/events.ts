import { Client, Events, GuildMemberRoleManager, Interaction } from 'discord.js';
import { botCommands, registerCommands } from './commands';

export const registerEvents = (botClient: Client) => {
    botClient.on(Events.ClientReady, async (client) => {
        console.log(`Registering ${botCommands.length} commands`);
        await registerCommands(client);

        console.log(`Logged in as ${botClient.user?.tag}!`);
    });

    botClient.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.member) return;

        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName;
            for (const command of botCommands) {
                if (command.builder.name === commandName) {
                    const cmdRoles = command.roles || [];
                    const cmdUsers = command.users || [];
                    if(!isAuthorized(cmdUsers, cmdRoles, interaction)) {
                        await interaction.reply('You are not authorized to use this command');
                        return;
                    }

                    await command.execute(interaction);
                }
            }
        } else if (interaction.isAutocomplete()) {
            const commandName = interaction.commandName;
            for (const command of botCommands) {
                if (command.builder.name === commandName) {
                    if (command.autocomplete) {
                        const cmdRoles = command.roles || [];
                        const cmdUsers = command.users || [];

                        if(!isAuthorized(cmdUsers, cmdRoles, interaction)) {
                            return;
                        }

                        await command.autocomplete(interaction);
                    }
                }
            }
        }
    });
};

const isAuthorized = (authorizedUsers: string[], authorizedRoles: string[], interaction: Interaction): boolean => {
    if(authorizedRoles.length === 0 && authorizedUsers.length === 0) {
        return true;
    }

    if (authorizedUsers.includes(interaction.user.id)) {
        return true;
    }

    const roles = interaction.member?.roles;
    if (roles instanceof GuildMemberRoleManager &&
        authorizedRoles.some((role) => roles.cache.has(role))
    ) {
        return true;
    }

    return false;
};
