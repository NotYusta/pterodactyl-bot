import dotenv from 'dotenv';
import { BotData } from './typings/bot';
import { Client } from 'discord.js';
import { registerEvents } from './events';
import { Pterodactyl } from './api/pterodactyl';
import { AxiosError, all } from 'axios';
dotenv.config();

const client = new Client({
    intents: ["GuildMembers", "Guilds", "GuildMessages", "MessageContent"]
});

const botData: BotData = {
    token: process.env.BOT_TOKEN!,
    client: client,
};

client.login(botData.token);
registerEvents(botData.client);

export const pterodactylClient = new Pterodactyl(process.env.PANEL_API_KEY!, process.env.PANEL_URL!);
async function test() {
    const response = await pterodactylClient.getNodes();
    if(response instanceof AxiosError) {
        console.log('Failed to get allocations', response.message);
        return;
    }

    const allocations = response[0];
    console.log(allocations.data);

    for(const allocation of allocations.data) {
        console.log(allocation.attributes.allocated_resources);
    }
}

test()
