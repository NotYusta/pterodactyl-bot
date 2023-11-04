import { Client } from 'discord.js';
import { createUserCommand } from './createUser';
import { pingCommand } from './ping';
import { createServerCommand } from './createServer';
import { renewCommand } from './renewServer';

export const botCommands = [createUserCommand, pingCommand, createServerCommand, renewCommand];
export const registerCommands = (client: Client<true>) => {
    for (const command of botCommands) {
        const builtCommand = command.build(command.builder);
        for (const guild of client.guilds.cache.values()) {
            guild.commands.create(builtCommand);
        }
    }
};
