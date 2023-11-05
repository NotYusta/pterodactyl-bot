import dotenv from 'dotenv';
import { BotData } from './typings/bot';
import { Client } from 'discord.js';
import { registerEvents } from './events';
import { PterodactylClient } from './api/pterodactyl';
import { autoSuspend, updatePteroEggs } from './utils';

dotenv.config();

const client = new Client({
    intents: ['GuildMembers', 'Guilds', 'GuildMessages', 'MessageContent', 'GuildMessageTyping', 'GuildPresences'],
});

const botData: BotData = {
    token: process.env.BOT_TOKEN!,
    client: client,
};

export const allowedNodes = process.env.ALLOWED_NODES?.split(',');
export const pterodactylClient = new PterodactylClient(process.env.PANEL_API_KEY!, process.env.PANEL_URL!);

async function run() {
    await updatePteroEggs();
    await autoSuspend();
    await client.login(botData.token);
    registerEvents(botData.client);
}

run();
