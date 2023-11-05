import { Client } from 'discord.js';
import { createUserCommand } from './createUser';
import { pingCommand } from './ping';
import { createServerCommand } from './createServer';
import { renewCommand } from './renewServer';
import { updateEggsCommand } from './updateEggs';
import { createServerSimpleCommand } from './createServerSimple';

export const botCommands = [createUserCommand, pingCommand, createServerCommand, renewCommand, updateEggsCommand, createServerSimpleCommand];
export const registerCommands = async (client: Client<true>) => {
    for (const command of botCommands) {
        const builtCommand = command.build(command.builder);
        for (const guild of client.guilds.cache.values()) {
            await guild.commands.create(builtCommand);
        }
    }
};
