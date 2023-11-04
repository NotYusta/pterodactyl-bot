import dotenv from 'dotenv';
import { BotData } from './typings/bot';
import { Client } from 'discord.js';
import { registerEvents } from './events';
import { PterodactylClient } from './api/pterodactyl';
import { autoSuspend } from './utils';

dotenv.config();

const client = new Client({
    intents: ['GuildMembers', 'Guilds', 'GuildMessages', 'MessageContent'],
});

const botData: BotData = {
    token: process.env.BOT_TOKEN!,
    client: client,
};

client.login(botData.token);
registerEvents(botData.client);

export const allowedNodes = process.env.ALLOWED_NODES?.split(',');
export const pterodactylClient = new PterodactylClient(process.env.PANEL_API_KEY!, process.env.PANEL_URL!);

autoSuspend();
