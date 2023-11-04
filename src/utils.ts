import fs from 'fs';
import { pterodactylClient } from '.';
import { ExpiryDataMap } from './typings/expiry';

const autoSuspendInterval = 60000;
const expiryFileName = 'expiry_date.json';
export const readExpiryData = () => (fs.existsSync(expiryFileName) ? fs.readFileSync(expiryFileName, 'utf8') : '{}');
export const updateExpiryData = (serverIdentifier: string, id: number, user: number, dayDuration: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + dayDuration);

    const data = JSON.parse(readExpiryData());
    const expiryData = data[serverIdentifier] || [];
    expiryData[0] = user;
    expiryData[1] = id;
    expiryData[2] = newDate.toISOString();

    data[serverIdentifier] = expiryData;

    fs.writeFileSync(expiryFileName, JSON.stringify(data, null, 4));
};

export const updateExpiryDataByServerId = (serverId: string, dayDuration: number) => {
    const data = JSON.parse(readExpiryData());
    const curDate = new Date(data[serverId][1]);
    curDate.setDate(curDate.getDate() + dayDuration);
    data[serverId][2] = curDate.toISOString();

    fs.writeFileSync(expiryFileName, JSON.stringify(data, null, 4));
};

export const autoSuspend = async () => {
    const expiryData = readExpiryData();
    const dataMap = JSON.parse(expiryData) as ExpiryDataMap;
    const keys = Object.keys(dataMap);
    for (const key of keys) {
        const server = dataMap[key];
        const expiry = new Date(server[2]);
        const serverId = server[1];

        console.log('Checking server', serverId, expiry.getTime(), Date.now());
        if (expiry.getTime() < Date.now()) {
            await pterodactylClient.suspendServer(serverId);
            console.log('Suspended server', serverId);
            continue;
        }
    }

    setTimeout(autoSuspend, autoSuspendInterval);
};
