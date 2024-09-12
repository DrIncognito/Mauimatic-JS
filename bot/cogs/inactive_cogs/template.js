const {  } = require('discord.js');
const prefix = process.env.DISCORD_PREFIX;

module.exports = {
  setup(client) {
    client.on('messageCreate', async message => {
      if (message.author.bot) return;

        // Check if the message starts with the prefix
      if (!message.content.startsWith(prefix)) return;
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

    })
  }
};