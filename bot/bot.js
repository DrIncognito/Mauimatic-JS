const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config({ path: './util/data/.env' }); // Specify the path to your .env file
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

  // Initialize an empty array for commands
  const commands = []; 
  const cogsManager = require('./cogs/cogs_manager.js'); // Ensure correct path
  cogsManager.setup(client, commands); // Pass the commands array to the setup

  // Function to send log messages to the specified channel
  const sendLogMessage = async (embed) => {
    const launchChannelId = process.env.BOT_LAUNCH_CHANNEL_ID;
    try {
      const launchChannel = await client.channels.fetch(launchChannelId);
      if (launchChannel) {
        await launchChannel.send({ embeds: [embed] });
      } else {
        console.error(`Channel with ID ${launchChannelId} not found`);
      }
    } catch (error) {
      console.error(`Error fetching channel with ID ${launchChannelId}:`, error);
    }
  };

  // Import and run the initialize script
  const createEnvFile = require('./util/env_maker.js');
  await createEnvFile();

  // Event handler for when the bot is ready
  client.once('ready', async () => {
    const logMessages = [];

    const launchChannelId = process.env.BOT_LAUNCH_CHANNEL_ID;
    let launchChannelName = 'Unknown';
    try {
      const launchChannel = await client.channels.fetch(launchChannelId);
      if (launchChannel) {
        launchChannelName = launchChannel.name;
      }
    } catch (error) {
      console.error(`Error fetching channel with ID ${launchChannelId}:`, error);
    }

    logMessages.push({ name: 'Bot Info', value: `Logged in as ${client.user.tag}` });
    logMessages.push({ name: 'Prefix', value: process.env.DISCORD_PREFIX });
    logMessages.push({ name: 'User Welcome Channel', value: `#${process.env.WELCOME_CHANNEL}` });
    logMessages.push({ name: 'Bot Launch Channel', value: `#${launchChannelName}` });

    let slashCommandResults = '';
    const data = await fsp.readFile('./util/slash.json');
    const commandsData = JSON.parse(data); // Parse the JSON string into an object
    for (const command of commandsData) {
      try {
        const registerCommand = await client.application.commands.create(command);
        slashCommandResults += `✓ ${registerCommand.name}\n`;
      } catch (error) {
        console.error(error);
        slashCommandResults += `× ${command.name}: ${error.message}\n`;
      }
    }
    logMessages.push({ name: 'Slash Commands', value: slashCommandResults });

    let cogInitializationResults = '';
    
    // Load cogs from the 'active_cogs' folder
    const cogsFolder = './cogs/active_cogs';
    const cogsFiles = fs.readdirSync(cogsFolder).filter(file => file.endsWith('.js'));

    for (const file of cogsFiles) {
      const cog = require(`${cogsFolder}/${file}`);
      try {
        cog.setup(client); // Call the setup method
        cogInitializationResults += `✓ ${file.slice(0, -3)}\n`;
      } catch (error) {
        console.error(error);
        cogInitializationResults += `× ${file.slice(0, -3)}: ${error.message}\n`;
      }
    }

    // Log cogs initialization results
    logMessages.push({ name: 'Cogs Initialization', value: cogInitializationResults });

    // Create and send the embed
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Bot Initialization Log')
      .setThumbnail("https://images-ext-2.discordapp.net/external/5aGsHd5C15CRF2WkGQYYg7uQs9evv-g5FnQSg3Tmyaw/http/smashinghub.com/wp-content/uploads/2014/08/cool-loading-animated-gif-8.gif")
      .addFields(logMessages)
      .setTimestamp();

    await sendLogMessage(embed);
  });

  client.login(process.env.BOT_TOKEN);
})();
