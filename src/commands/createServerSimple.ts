import { SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { AxiosError } from 'axios';
import { pterodactylClient } from '..';
import { pteroEggs, setExpiryDataByServerIdf } from '../utils';

const allowedLocation = [2];
export const createServerSimpleCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    autocomplete: async (interaction) => {
        const focusedOption = interaction.options.getFocused(true);
        if (!focusedOption) {
            return;
        }

        if (focusedOption.name == 'egg') {
            const eggs = pteroEggs
                .filter((egg) => egg.attributes.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .map((e) => ({
                    name: e.attributes.name,
                    value: e.attributes.name,
                }));

            if (eggs.length == 0) {
                return;
            }

            if (eggs.length > 25) {
                const lessEggs = eggs.slice(0, 25);
                await interaction.respond(lessEggs);
                return;
            }

            await interaction.respond(eggs);
        }

        if (focusedOption.name == 'environment') {
            const eggOption = interaction.options.getString('egg', false);
            if (!eggOption) {
                return;
            }

            const eggData = pteroEggs.find((egg) => egg.attributes.name === eggOption);
            if (!eggData) {
                return;
            }

            const environment = eggData.attributes.relationships.variables.data
                .filter((variable) =>
                    variable.attributes.env_variable.toLowerCase().startsWith(focusedOption.value.toLowerCase())
                )
                .map((variable) => ({
                    name: variable.attributes.env_variable,
                    value: variable.attributes.env_variable,
                }));

            if (environment.length == 0) {
                return;
            }

            if (environment.length > 25) {
                const lessEnvironment = environment.slice(0, 25);
                await interaction.respond(lessEnvironment);
                return;
            }

            await interaction.respond(environment);
        }
    },
    execute: async (interaction) => {
        await interaction.deferReply();
        await interaction.editReply('Creating server...');

        const nameOption = interaction.options.getString('name', true);
        const emailOption = interaction.options.getString('email', true);
        const eggOption = interaction.options.getString('egg', true);
        const memoryOption = interaction.options.getNumber('memory', true);
        const diskOption = interaction.options.getNumber('disk', true);
        const databasesOption = interaction.options.getNumber('databases', true);
        const allocationsOption = interaction.options.getNumber('allocations', true);
        const backupsOption = interaction.options.getNumber('backups', true);
        const cpuOption = interaction.options.getNumber('cpu', true);

        const date = new Date();
        date.setDate(date.getDate() + 30);

        const descriptionOption =
            interaction.options.getString('description', false) ||
            `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
        const environmentOption = interaction.options.getString('environment', false);

        const eggData = pteroEggs.find((egg) => egg.attributes.name === eggOption);
        if (!eggData) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, egg not found`);
            return;
        }

        const resUser = await pterodactylClient.getUsers(emailOption);
        if (resUser instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, failed to get user`);

            console.log('Failed to create server', resUser.toJSON());
            return;
        }

        const userData = resUser[0].filter((user) => user.attributes.email === emailOption)[0];
        if (!userData) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, user not found`);
            return;
        }

        const resNodes = await pterodactylClient.getNodes();
        if (resNodes instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, failed to get nodes`);

            console.log('Failed to create server', resNodes.toJSON());
            return;
        }

        const nodesData = resNodes[0].data.filter((node) => allowedLocation.includes(node.attributes.location_id));
        // find the lowest usage node
        const nodeData = nodesData.sort(
            (a, b) => a.attributes.memory_overallocate - b.attributes.memory_overallocate
        )[0];
        if (!nodeData) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, no node found`);

            console.log('Failed to create server', 'No node found');
            return;
        }

        const resAllocations = await pterodactylClient.getAllocations(nodeData.attributes.id);
        if (resAllocations instanceof AxiosError) {
            await interaction.editReply(`Failed to create server \`${nameOption}\, failed to get allocations`);

            console.log('Failed to create server', resAllocations.toJSON());
            return;
        }

        const allocationsData = resAllocations[0].data;
        const primaryAllocation = allocationsData.find((allocation) => !allocation.attributes.assigned)?.attributes;
        if (!primaryAllocation) {
            await interaction.editReply(`Failed to create server \`${nameOption}\`, no primary allocation found`);

            console.log('Failed to create server', 'No primary allocation found');
            return;
        }

        const eggEnvironment: { [x: string]: string } = {};
        for (const varEgg of eggData.attributes.relationships.variables.data) {
            eggEnvironment[varEgg.attributes.env_variable] = varEgg.attributes.default_value;
        }

        if (environmentOption) {
            environmentOption.split(',').forEach((env) => {
                const split = env.split('=');
                eggEnvironment[split[0]] = split[1];
            });
        }

        const response = await pterodactylClient.createServer({
            name: nameOption,
            user: userData.attributes.id,
            egg: eggData.attributes.id,
            docker_image: eggData.attributes.docker_image,
            startup: eggData.attributes.startup,
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
            await interaction.editReply(`Failed to create server \`${nameOption}\``);

            console.log('Failed to create server', response.toJSON());
            return;
        }

        const serverData = response[0].attributes;
        setExpiryDataByServerIdf(serverData.identifier, serverData.id, serverData.name, serverData.user, date);
        await interaction.editReply(`Created server ${nameOption} with ID ${response[0].attributes.id}`);
    },
    build: (commandBuilder) => {
        const nameOption = new SlashCommandStringOption();
        nameOption.setName('name');
        nameOption.setDescription('The name of the server');
        nameOption.setRequired(true);

        const emailOption = new SlashCommandStringOption();
        emailOption.setName('email');
        emailOption.setDescription('The email of the user');
        emailOption.setRequired(true);

        const eggOption = new SlashCommandStringOption();
        eggOption.setName('egg');
        eggOption.setDescription('The egg of the server');
        eggOption.setRequired(true);
        eggOption.setAutocomplete(true);

        const memoryOption = new SlashCommandNumberOption();
        memoryOption.setName('memory');
        memoryOption.setDescription('The memory of the server in MB (1000MB = 1GB)');
        memoryOption.setRequired(true);

        const diskOption = new SlashCommandNumberOption();
        diskOption.setName('disk');
        diskOption.setDescription('The disk of the server in MB (1000MB = 1GB)');
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
        cpuOption.setDescription('The CPU of the server');
        cpuOption.setRequired(true);

        const descriptionOption = new SlashCommandStringOption();
        descriptionOption.setName('description');
        descriptionOption.setDescription('The description of the server');
        descriptionOption.setRequired(false);

        const environmentOption = new SlashCommandStringOption();
        environmentOption.setName('environment');
        environmentOption.setDescription('The environment of the server');
        environmentOption.setRequired(false);
        environmentOption.setAutocomplete(true);

        commandBuilder.addStringOption(nameOption);
        commandBuilder.addStringOption(emailOption);
        commandBuilder.addStringOption(eggOption);
        commandBuilder.addNumberOption(memoryOption);
        commandBuilder.addNumberOption(diskOption);
        commandBuilder.addNumberOption(databasesOption);
        commandBuilder.addNumberOption(allocationsOption);
        commandBuilder.addNumberOption(backupsOption);
        commandBuilder.addNumberOption(cpuOption);
        commandBuilder.addStringOption(descriptionOption);
        commandBuilder.addStringOption(environmentOption);

        return commandBuilder;
    },
};
