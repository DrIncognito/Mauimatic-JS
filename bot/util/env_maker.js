const fs = require('fs');
const readline = require('readline');
const path = './util/data/.env'; // Path to the .env file

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const createEnvFile = async () => {
  if (!fs.existsSync(path)) {
    console.log('.env file not found. Creating a new one...');

    const botToken = await askQuestion('Enter BOT_TOKEN: ');
    const discordPrefix = await askQuestion('Enter DISCORD_PREFIX: ');
    const welcomeChannel = await askQuestion('Enter WELCOME_CHANNEL: ');

    const envContent = `BOT_TOKEN=${botToken}\nDISCORD_PREFIX=${discordPrefix}\nWELCOME_CHANNEL=${welcomeChannel}\n`;

    fs.writeFileSync(path, envContent, 'utf8');
    console.log('.env file created successfully.');

    rl.close();
  } else {
    console.log('.env file already exists.');
    rl.close();
  }
};

module.exports = createEnvFile;