const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');
const storeMemberActivity = require('./service/postMemberActivity');
const { token, mongodbUrl } = require('./config.json');

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages,]
});

// setup mongodb
database = new MongoClient(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {

  // console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an ${interaction.customId}.`);

  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'checkin-modal') {
      // Get the data entered by the user
      const basicQuestionsResponse = interaction.fields.getTextInputValue('basicQuestions');
      const bonusQuestionsResponse = interaction.fields.getTextInputValue('bonusQuestions');
      const diaryResponse = interaction.fields.getTextInputValue('diary');

      // // Store the answers in MongoDB Atlas
      const storeResult = await storeMemberActivity(interaction.user, basicQuestionsResponse, bonusQuestionsResponse, diaryResponse);

      // console.log(storeResult);

      if (storeResult.success) {
        await interaction.reply({ content: `Checkin 成功了! 😊 \n ${storeResult.message}` });
      } else {
        console.error(`Error storing interaction responses: ${storeResult.message}`);
        await interaction.reply({ content: `Checkin 失敗了! 🥲 \n ${storeResult.message}` });
      }
    }

  } else {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }


    if (!command) return;

  }




});

client.login(token);