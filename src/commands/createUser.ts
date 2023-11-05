import { SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../typings/bot';
import { pterodactylClient } from '..';
import { AxiosError } from 'axios';

export const createUserCommand: BotCommand = {
    builder: new SlashCommandBuilder(),
    execute: async (interaction) => {
        await interaction.deferReply();
        await interaction.editReply('Creating user...');
        const username = interaction.options.getString('username', true);
        const email = interaction.options.getString('email', true);

        const password = interaction.options.getString('password', false) || '';
        const firstName = interaction.options.getString('firstname', false) || username;
        const lastName = interaction.options.getString('lastname', false) || username;

        const response = await pterodactylClient.createUser({
            username: username,
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
        });

        if (response instanceof AxiosError) {
            await interaction.editReply(`Failed to create user \`${username}\``);

            console.log('Failed to create user', response);
            return;
        }

        await interaction.editReply(`Created user ${username} with email ${email}`);
    },
    build: (commandBuilder) => {
        const usernameOption = new SlashCommandStringOption();
        usernameOption.setName('username');
        usernameOption.setDescription('The username of the user');
        usernameOption.setRequired(true);

        const emailOption = new SlashCommandStringOption();
        emailOption.setName('email');
        emailOption.setDescription('The email of the user');
        emailOption.setRequired(true);

        const passwordOption = new SlashCommandStringOption();
        passwordOption.setName('password');
        passwordOption.setDescription('The password of the user');
        passwordOption.setRequired(false);

        const firstNameOption = new SlashCommandStringOption();
        firstNameOption.setName('firstname');
        firstNameOption.setDescription('The first name of the user');
        firstNameOption.setRequired(false);

        const lastNameOption = new SlashCommandStringOption();
        lastNameOption.setName('lastname');
        lastNameOption.setDescription('The last name of the user');
        lastNameOption.setRequired(false);

        const options = [usernameOption, emailOption, passwordOption, firstNameOption, lastNameOption];

        options.forEach((option) => commandBuilder.addStringOption(option));

        return commandBuilder;
    },
};
