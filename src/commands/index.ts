import { Client } from 'discord.js';
import { createUserCommand } from './createUser';
import { pingCommand } from './ping';
import { createServerCommand } from './createServer';
import { renewCommand } from './renewServer';
import { updateEggsCommand } from './updateEggs';
import { createServerSimpleCommand } from './createServerSimple';
import { config } from '../config';
import { BotCommand } from '../typings/bot';

export const labels = {
    createServer: 'create-server',
    createServerSimple: 'create-server-simple',
    createUser: 'create-user',
    ping: 'ping',
    renewServer: 'renew-server',
    updateEggs: 'update-eggs',
};
export const botCommands: [string, BotCommand][] = [
    [labels.createServer, createServerCommand],
    [labels.createServerSimple, createServerSimpleCommand],
    [labels.createUser, createUserCommand],
    [labels.ping, pingCommand],
    [labels.renewServer, renewCommand],
    [labels.updateEggs, updateEggsCommand],
];

export const registerCommands = async (client: Client<true>) => {
    for (const command of botCommands) {
        const labelCmd = command[0];
        const botCmd = command[1];

        const builtCommand = botCmd.build(botCmd.builder);
        const cmdConfig = config.commands[labelCmd];

        console.log(`Setting name and description for ${labelCmd}`);
        if (cmdConfig) {
            console.log(
                `> Setting name and description for ${labelCmd} to ${cmdConfig.name} and ${cmdConfig.description}`
            );
            builtCommand.setName(cmdConfig.name);
            builtCommand.setDescription(cmdConfig.description);
            
            botCmd.roles = cmdConfig.access.roles;
            botCmd.users = cmdConfig.access.users;
        } else {
            console.log(`> Setting name and description for ${labelCmd} to ${labelCmd}`);
            builtCommand.setName(labelCmd);
            builtCommand.setDescription(labelCmd);
        }

        for (const guild of client.guilds.cache.values()) {
            await guild.commands.create(builtCommand);
        }
    }
};
