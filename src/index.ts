import dotenv from 'dotenv';
import { BotData } from './typings/bot';
import { Client } from 'discord.js';
import { registerEvents } from './events';
import { Pterodactyl } from './api/pterodactyl';
dotenv.config();

const client = new Client({
    intents: [7796],
});

const botData: BotData = {
    token: process.env.BOT_TOKEN!,
    client: client,
};

client.login(botData.token);
registerEvents(botData.client);

export const pterodactylClient = new Pterodactyl(process.env.PANEL_API_KEY!, process.env.PANEL_URL!);
async function test() {
    const suspended = await pterodactylClient.suspendServer(1613);
    console.log(suspended);
}

test()
