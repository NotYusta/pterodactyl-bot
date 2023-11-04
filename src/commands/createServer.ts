import { SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { allowedNodes, pterodactylClient } from '..';
import { AxiosError } from 'axios';
import { updateExpiryData } from '../utils';



export const createServerCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.deferReply();
        await interaction.editReply('Creating server...');

        const userId = interaction.options.getNumber('user', true);
        const name = interaction.options.getString('name', true);
        const nest = interaction.options.getNumber('nest', true);
        const egg = interaction.options.getNumber('egg', true);
        const memory = interaction.options.getNumber('memory', true);
        const disk = interaction.options.getNumber('disk', true);
        const databases = interaction.options.getNumber('databases', true);
        const allocations = interaction.options.getNumber('allocations', true);
        const backups = interaction.options.getNumber('backups', true);
        const cpu = interaction.options.getNumber('cpu', true);
        const node = interaction.options.getNumber('node', true);
        const expiryDays = interaction.options.getNumber('expirydays', true);
        const description = interaction.options.getString('description', false) || undefined;
        const environment = interaction.options.getString('environment', false) || undefined;

        if(expiryDays > 1000) {
            await interaction.editReply('Expiry days cannot be greater than 1000');
            return;
        }

        if(expiryDays < 1) {
            await interaction.editReply('Expiry days cannot be less than 1');
            return;
        }


        if (allowedNodes && !allowedNodes.includes(`${node}`)) {
            await interaction.editReply(
                `Failed to create server \`${name}\`, node is not allowed, allowed nodes are: \`${allowedNodes.join(
                    ', '
                )}\``
            );

            console.log('Failed to create server', 'Node is not allowed');
            return;
        }

        const resAllocations = await pterodactylClient.getAllocations(node);
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

        const eggRes = await pterodactylClient.getEgg(nest, egg);
        if (eggRes instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${name}\`, failed to get egg`);

            console.log('Failed to create server', eggRes.toJSON());
            return;
        }

        const eggData = eggRes[0].attributes;
        const eggEnvironment: { [x: string]: string } = {};
        if (environment) {
            environment.split(',').forEach((env) => {
                const split = env.split('=');
                eggEnvironment[split[0]] = split[1];
            });
        }
        const response = await pterodactylClient.createServer({
            user: userId,
            name: name,
            egg: egg,
            docker_image: eggData.docker_image,
            startup: eggData.startup,
            description: description,
            feature_limits: {
                databases: databases,
                allocations: allocations,
                backups: backups,
            },
            allocation: {
                default: primaryAllocation.id,
            },
            environment: eggEnvironment,
            limits: {
                memory: memory,
                disk: disk,
                swap: 0,
                io: 500,
                cpu: cpu * 100,
            },
        });

        if (response instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${name}\``);

            console.log('Failed to create server', response.toJSON());
            return;
        }

        updateExpiryData(response[0].attributes.identifier, response[0].attributes.id, userId, expiryDays);
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

        const nestOption = new SlashCommandNumberOption();
        nestOption.setName('nest');
        nestOption.setDescription('The nest of the server');
        nestOption.setRequired(true);

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
        commandBuilder.addNumberOption(nestOption);
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
