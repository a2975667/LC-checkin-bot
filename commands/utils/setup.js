const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		
	},
};