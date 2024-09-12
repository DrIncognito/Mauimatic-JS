const { Client, GatewayIntentBits} = require('discord.js');
const fsp = require('fs').promises;
const fs = require('fs');

(async () => {
  const chalk = (await import('chalk')).default; // Import chalk dynamically

  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildEmojisAndStickers,
    ] 
  });

  // Import and run the initialize script
  const createEnvFile = require('./util/env_maker.js');
  await createEnvFile();
  require('dotenv').config({ path: './util/data/.env' }); // For your bot token stored in .env file

// Event handler for when the bot is ready
client.once('ready', async () => {
  console.log(chalk.yellow(`|--- Registering Slash Commands ---`));
  const data = await fsp.readFile('./util/slash.json');
  const commands = JSON.parse(data); // Parse the JSON string into an object
  for(const command of commands) {
    try {
      const registerCommand = await client.application.commands.create(command);
      console.log(chalk.green(`|Successfully registered command ${registerCommand.name}`));
    }catch(error) {
      console.error(error);
    }
  }
  console.log(chalk.blueBright(`|--- End Registering Slash Commands ---\n`));

  console.log(chalk.cyan(`|--- Bot Info ---`));
  console.log(chalk.cyan(`|Logged in as ${client.user.tag}`));
  console.log(chalk.cyan(`|Prefix: ${process.env.DISCORD_PREFIX}`));
  console.log(chalk.cyan(`|--- Bot is Live ---`));
});

const cogsFolder = './cogs/active_cogs';
const cogsFile = fs.readdirSync(cogsFolder).filter(file => file.endsWith('.js'));
console.log(chalk.yellow(`|--- Initializing Cogs  ---`));
for (const file of cogsFile) {  
  const cog = require(`${cogsFolder}/${file}`);
  try {
    cog.setup(client);
    console.log(chalk.green(`|✓ ${file.slice(0, -3)}`));
  } catch (error) { 
    console.error(chalk.red(`|× ${file.slice(0, -3)}: \nerr -> ${error}`));
  } 
}
console.log(chalk.blueBright(`|--- End Init Cogs  ---\n`));

client.login(process.env.BOT_TOKEN);
})();
