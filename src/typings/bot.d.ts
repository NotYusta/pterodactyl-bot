import { Client, ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } from 'discord.js';

export interface BotData {
    client: Client;
    token: string;
}

export interface BotCommand {
    builder: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    build: (commandBuilder: SlashCommandBuilder) => SlashCommandBuilder;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    roles?: string[];
    users?: string[];
}
