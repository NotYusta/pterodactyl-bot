import fs from 'fs';
import { pterodactylClient } from '.';
import { ExpiryData, ExpiryDataMap } from './typings/expiry';
import { IEgg } from './typings/pterodactyl';

const autoSuspendInterval = 60000;
const expiryFileName = 'expiry_date.json';
export const readExpiryData = () => (fs.existsSync(expiryFileName) ? fs.readFileSync(expiryFileName, 'utf8') : '{}');
export const updateExpiryDataByServerIdf = (serverIdentifier: string, dayDuration: number) => {
    const expiryData: ExpiryDataMap = JSON.parse(readExpiryData());
    let expiryDataServer = expiryData[serverIdentifier];
    if (!expiryDataServer) {
        return;
    }

    const expiry = new Date() || expiryDataServer.expiry;
    expiry.setDate(expiry.getDate() + dayDuration);

    expiryDataServer.expiry = expiry;

    fs.writeFileSync(expiryFileName, JSON.stringify(expiryData, null, 4));
};

export const setExpiryDataByServerIdf = (
    serverIdentifier: string,
    id: number,
    name: string,
    userId: number,
    expiry: Date
) => {
    const expiryData: ExpiryDataMap = JSON.parse(readExpiryData());
    expiryData[serverIdentifier] = {
        id,
        name,
        userId,
        expiry,
    };

    fs.writeFileSync(expiryFileName, JSON.stringify(expiryData, null, 4));
};

export const updateServersExpiry = async (): Promise<boolean> => {
    console.log('Updating servers expiry');
    const resServers = await pterodactylClient.getServers();
    if (resServers instanceof Error) {
        return false;
    }

    const servers = resServers[0].data;
    for (const server of servers) {
        const description = server.attributes.description;
        const serverId = server.attributes.id;
        const serverIdentifier = server.attributes.identifier;
        const expiryDate = getServerExpiredDate(description);
        if (!expiryDate) {
            console.log('Failed to update server expiry', 'Failed to get expiry date');
            continue;
        }

        const expiryData = JSON.parse(readExpiryData());
        const expiryDataServer = expiryData[serverIdentifier];
        if (!expiryDataServer) {
            console.log('Failed to get expiry data for server', serverId);
            setExpiryDataByServerIdf(
                serverIdentifier,
                serverId,
                server.attributes.name,
                server.attributes.user,
                expiryDate
            );
            continue;
        }
    }

    return true;
};

export const getServerExpiredDate = (description: string): Date | undefined => {
    const splitted = description.split('/');
    if (splitted.length < 2) {
        return undefined;
    }

    const dateMonth = splitted[0];
    const dateDay = splitted[1];
    const dateYear = splitted[2];

    const date = new Date();
    date.setFullYear(parseInt(dateYear));
    date.setMonth(parseInt(dateMonth) - 1);
    date.setDate(parseInt(dateDay));

    return date;
};

export const autoSuspend = async () => {
    await updateServersExpiry();
    const expiryData = readExpiryData();
    const dataMap = JSON.parse(expiryData) as ExpiryDataMap;
    const keys = Object.keys(dataMap);
    for (const key of keys) {
        const server = dataMap[key];
        if (!server) {
            continue;
        }

        const expiry = new Date(server.expiry);
        const serverId = server.id;

        console.log('Checking server', serverId, expiry.getTime(), Date.now());
        if (expiry.getTime() < Date.now()) {
            await pterodactylClient.suspendServer(serverId);
            console.log('Suspended server', serverId);
            continue;
        }
    }

    setTimeout(autoSuspend, autoSuspendInterval);
};

export const pteroEggs: IEgg[] = [];
export const updatePteroEggs = async () => {
    console.log('Loading ptero eggs');
    const nests = await pterodactylClient.getNests();
    if (nests instanceof Error) {
        throw nests;
    }

    const updatedEggs = [];
    const nestIds = nests[0].data.map((nest) => nest.attributes.id);
    for (const nestId of nestIds) {
        const eggs = await pterodactylClient.getEggs(nestId);
        if (eggs instanceof Error) {
            throw eggs;
        }

        updatedEggs.push(...eggs[0]);
    }

    pteroEggs.splice(0, pteroEggs.length);
    pteroEggs.push(...updatedEggs);
    console.log('Loaded ptero eggs');
};
