const { SlashCommandBuilder } = require('discord.js');
const getLeaderboard = require('../../service/getLeaderBoard');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Display current leaderboard.'),
	async execute(interaction) {
		// return async await result from mongoDBService.js  getLeaderboard = async (startDate, endDate)
		// get this month's first day and last day
		const today = new Date();
		let firstDay = undefined;
		let lastDay = undefined;

		// trial dates, to be removed: if month === june, then we only take 1 month
		if (today.getMonth() === 5) {
			firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
			lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		} else {
			firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
			lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0);
		}

		let results = await getLeaderboard(firstDay, lastDay);

		results.sort((a, b) => {
			const pointsA = a.sumBasic + a.sumBonus * 2 + a.datesAllChecked.length;
			const pointsB = b.sumBasic + b.sumBonus * 2 + b.datesAllChecked.length;
			return pointsB - pointsA;
		});

		// Initialize an empty result array
		const message = [];

		// Iterate over the sorted data array and generate the final string for each item
		results.forEach((item, index) => {
			const { teamName, sumBasic, sumBonus, datesAllChecked } = item;

			// Calculate the number of all check-ins
			const allCheckins = datesAllChecked.length;

			// Calculate the total points
			const totalPoints = (sumBonus * 2) + sumBasic;

			// Construct the final string for the current item
			const itemString = `[第${index + 1}名] ${teamName} 獲得 ${totalPoints} 積分。截至目前團隊完成了${sumBonus}題 medium/hard 和 ${sumBasic} 題其他練習題。團隊有 ${allCheckins} 天全員簽到!`;

			// Push the item string to the result array
			message.push(itemString);
		});

		// Join the result array with line breaks to form the final string
		const finalString = "這輪排行:\n" + message.join('\n');

		return interaction.reply(finalString);
	},
};