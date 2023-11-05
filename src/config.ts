import { IConfig } from './typings/config';
import yaml from 'yaml';
import fs from 'fs';

export const config: IConfig = {
    commands: {},
};

export const loadConfig = (fileName: string) => {
    const file = fs.readFileSync(fileName, 'utf8');
    const configData = yaml.parse(file);
    config.commands = configData.commands;
};
