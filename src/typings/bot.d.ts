import { Client, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface BotData {
    client: Client;
    token: string;
}

export interface BotCommand {
    builder: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    build: (commandBuilder: SlashCommandBuilder) => SlashCommandBuilder;
    roles?: string[];
    users?: string[];
}
