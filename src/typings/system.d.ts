import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

interface BotCommand {
    builder: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    build: (commandBuilder: SlashCommandBuilder) => SlashCommandBuilder;
    roles?: string[];
    users?: string[];
}
