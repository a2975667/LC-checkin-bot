const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkin')
		.setDescription('Checkin your activity.'),
	// async execute(interaction) {
	// 	// interaction.user is the object representing the User who ran the command
	// 	// interaction.member is the GuildMember object, which represents the user in the specific guild
	// 	await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	// },
	async execute(interaction) {
		// await interaction.reply('Pong!');
		// interaction.user.username
		
		const date = new Date();
		const userID = interaction.user.username;

		const date_string = date.toLocaleString('en-US', {
			timeZone: 'America/Chicago',
			month: '2-digit',
			day: '2-digit'
		});
		const titleUserID = userID.length > 21 ? userID.substring(0, 21) + '...' : userID;

		const modal = new ModalBuilder()
			.setCustomId('checkin-modal')
			.setTitle(`${titleUserID} checking in for ${date_string}`)

		// Create the text input components
		const basicQuestions = new TextInputBuilder()
			.setCustomId('basicQuestions')
			// The label is the prompt the user sees for this input
			.setLabel("我完成了幾題 Leetcode Easy 或其他平台的題目? (0-100)")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const bonusQuestions = new TextInputBuilder()
			.setCustomId('bonusQuestions')
			.setLabel("我完成了幾題 Leetcode Medium/Hard 的題目? (0-100)")
			.setStyle(TextInputStyle.Short);
		
		const diary = new TextInputBuilder()
		  	.setCustomId('diary')
			  .setLabel("我還完成了這些其他事情! (文字)")
			.setStyle(TextInputStyle.Paragraph);

		const bonusQuestionRow = new ActionRowBuilder().addComponents(bonusQuestions);
		const basicQuestionRow = new ActionRowBuilder().addComponents(basicQuestions);
		const diaryRow = new ActionRowBuilder().addComponents(diary);

		// Add inputs to the modal
		modal.addComponents(basicQuestionRow, bonusQuestionRow, diaryRow);

		// Show the modal to the user
		await interaction.showModal(modal);
	},
};
