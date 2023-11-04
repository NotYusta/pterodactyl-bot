import { Client } from 'discord.js';
import { createUserCommand } from './createUser';
import { pingCommand } from './ping';

export const botCommands = [createUserCommand, pingCommand];
export const registerCommands = (client: Client<true>) => {
    for (const command of botCommands) {
        const builtCommand = command.build(command.builder);
        for (const guild of client.guilds.cache.values()) {
            guild.commands.create(builtCommand);
        }
    }
};
