const { Client, GatewayIntentBits} = require('discord.js');
require('dotenv').config(); // For your bot token stored in .env file
const fsp = require('fs').promises;
const fs = require('fs');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ] 
  });

// Event handler for when the bot is ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const data = await fsp.readFile('./util/slash.json');
  const commands = JSON.parse(data); // Parse the JSON string into an object
  for(const command of commands) {
    try {
      const registerCommand = await client.application.commands.create(command);
      console.log(`Successfully registered command ${registerCommand.name}`);
    }catch(error) {
      console.error(error);
    }
  }
});

const cogsFolder = './cogs/active_cogs';
const cogsFile = fs.readdirSync(cogsFolder).filter(file => file.endsWith('.js'));
for (const file of cogsFile) {  
  const cog = require(`${cogsFolder}/${file}`);
  cog.setup(client);
}

client.login(process.env.BOT_TOKEN);
