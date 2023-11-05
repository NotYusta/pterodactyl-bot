import { SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { allowedNodes, pterodactylClient } from '..';
import { AxiosError } from 'axios';
import { pteroEggs, setExpiryDataByServerIdf } from '../utils';

export const createServerCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.deferReply();
        await interaction.editReply('Creating server...');

        const userIdOption = interaction.options.getNumber('user', true);
        const nameOption = interaction.options.getString('name', true);
        const eggOption = interaction.options.getNumber('egg', true);
        const memoryOption = interaction.options.getNumber('memory', true);
        const diskOption = interaction.options.getNumber('disk', true);
        const databasesOption = interaction.options.getNumber('databases', true);
        const allocationsOption = interaction.options.getNumber('allocations', true);
        const backupsOption = interaction.options.getNumber('backups', true);
        const cpuOption = interaction.options.getNumber('cpu', true);
        const nodeOption = interaction.options.getNumber('node', true);
        const expiryDaysOption = interaction.options.getNumber('expirydays', true);
        const descriptionOption = interaction.options.getString('description', false) || '';
        const environmentOption = interaction.options.getString('environment', false);

        if (expiryDaysOption > 1000) {
            await interaction.editReply('Expiry days cannot be greater than 1000');
            return;
        }

        if (expiryDaysOption < 1) {
            await interaction.editReply('Expiry days cannot be less than 1');
            return;
        }

        if (allowedNodes && !allowedNodes.includes(`${nodeOption}`)) {
            await interaction.editReply(
                `Failed to create server \`${name}\`, node is not allowed, allowed nodes are: \`${allowedNodes.join(
                    ', '
                )}\``
            );

            console.log('Failed to create server', 'Node is not allowed');
            return;
        }

        const resAllocations = await pterodactylClient.getAllocations(nodeOption);
        if (resAllocations instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${name}\, failed to get allocations`);

            console.log('Failed to create server', resAllocations.toJSON());
            return;
        }

        const allocationsData = resAllocations[0].data;
        const primaryAllocation = allocationsData.find((allocation) => !allocation.attributes.assigned)?.attributes;
        if (!primaryAllocation) {
            await interaction.editReply(`Failed to create server \`${name}\`, no primary allocation found`);

            console.log('Failed to create server', 'No primary allocation found');
            return;
        }

        const eggData = pteroEggs.find((eggData) => eggData.attributes.id === eggOption)?.attributes;
        if (!eggData) {
            await interaction.editReply(`Failed to create server \`${name}\`, egg not found`);

            console.log('Failed to create server', 'Egg not found');
            return;
        }

        const eggEnvironment: { [x: string]: string } = {};
        if (environmentOption) {
            environmentOption.split(',').forEach((env) => {
                const split = env.split('=');
                eggEnvironment[split[0]] = split[1];
            });
        }
        const response = await pterodactylClient.createServer({
            name: nameOption,
            user: userIdOption,
            egg: eggOption,
            docker_image: eggData.docker_image,
            startup: eggData.startup,
            environment: eggEnvironment,
            limits: {
                memory: memoryOption,
                swap: 0,
                disk: diskOption,
                io: 500,
                cpu: cpuOption,
            },
            feature_limits: {
                databases: databasesOption,
                allocations: allocationsOption,
                backups: backupsOption,
            },
            allocation: {
                default: primaryAllocation.id,
            },
            description: descriptionOption,
        });

        if (response instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${name}\``);

            console.log('Failed to create server', response.toJSON());
            return;
        }

        const date = new Date();
        date.setDate(date.getDate() + expiryDaysOption);
        setExpiryDataByServerIdf(response[0].attributes.identifier, response[0].attributes.id, nameOption, userIdOption, date);
        await interaction.editReply(`Created server ${name} with ID ${response[0].attributes.id}`);
    },
    build: (commandBuilder) => {
        commandBuilder.setName('createserver');
        commandBuilder.setDescription('Create a new server');

        const userIdOption = new SlashCommandNumberOption();
        userIdOption.setName('user');
        userIdOption.setDescription('The user ID of the server');
        userIdOption.setRequired(true);

        const nameOption = new SlashCommandStringOption();
        nameOption.setName('name');
        nameOption.setDescription('The name of the server');
        nameOption.setRequired(true);

        const eggOption = new SlashCommandNumberOption();
        eggOption.setName('egg');
        eggOption.setDescription('The egg of the server');
        eggOption.setRequired(true);

        const memoryOption = new SlashCommandNumberOption();
        memoryOption.setName('memory');
        memoryOption.setDescription('The memory of the server');
        memoryOption.setRequired(true);

        const diskOption = new SlashCommandNumberOption();
        diskOption.setName('disk');
        diskOption.setDescription('The disk of the server');
        diskOption.setRequired(true);

        const databasesOption = new SlashCommandNumberOption();
        databasesOption.setName('databases');
        databasesOption.setDescription('The databases of the server');
        databasesOption.setRequired(true);

        const allocationsOption = new SlashCommandNumberOption();
        allocationsOption.setName('allocations');
        allocationsOption.setDescription('The allocations of the server');
        allocationsOption.setRequired(true);

        const backupsOption = new SlashCommandNumberOption();
        backupsOption.setName('backups');
        backupsOption.setDescription('The backups of the server');
        backupsOption.setRequired(true);

        const cpuOption = new SlashCommandNumberOption();
        cpuOption.setName('cpu');
        cpuOption.setDescription('The logical core count of the server cpu');
        cpuOption.setRequired(true);

        const nodeOption = new SlashCommandNumberOption();
        nodeOption.setName('node');
        nodeOption.setDescription('The node of the server');
        nodeOption.setRequired(true);

        const expiryDays = new SlashCommandNumberOption();
        expiryDays.setName('expirydays');
        expiryDays.setDescription('The expiry days of the server');
        expiryDays.setRequired(true);

        const descriptionOption = new SlashCommandStringOption();
        descriptionOption.setName('description');
        descriptionOption.setDescription('The description of the server');
        descriptionOption.setRequired(false);

        const environmentOption = new SlashCommandStringOption();
        environmentOption.setName('environment');
        environmentOption.setDescription('The environment of the server');
        environmentOption.setRequired(false);

        commandBuilder.addNumberOption(userIdOption);
        commandBuilder.addStringOption(nameOption);
        commandBuilder.addNumberOption(eggOption);
        commandBuilder.addNumberOption(memoryOption);
        commandBuilder.addNumberOption(diskOption);
        commandBuilder.addNumberOption(databasesOption);
        commandBuilder.addNumberOption(allocationsOption);
        commandBuilder.addNumberOption(backupsOption);
        commandBuilder.addNumberOption(cpuOption);
        commandBuilder.addNumberOption(nodeOption);
        commandBuilder.addNumberOption(expiryDays);

        commandBuilder.addStringOption(descriptionOption);
        commandBuilder.addStringOption(environmentOption);

        return commandBuilder;
    },
};
