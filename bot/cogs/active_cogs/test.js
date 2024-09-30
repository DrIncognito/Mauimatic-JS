const { EmbedBuilder } = require('discord.js');
const prefix = process.env.DISCORD_PREFIX;

module.exports = {
  name: 'test', // Command name
  description: 'This is a test command to check functionality.', // Command description
  usage: '', // Any arguments or options the command uses
  category: 'Utility', // Command category
  setup(client) {
    client.on('messageCreate', async message => {
      if (message.author.bot) return;
      if (['heyo', 'hello', 'hi', 'hey', 'yo'].includes(message.content.toLowerCase())) {
        message.reply(`Hello, ${message.author}!`);
      }
        // Check if the message starts with the prefix
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (command === 'test') {
        const embed = new EmbedBuilder()
          .setTitle('Test was successful!')
          // .setDescription('The test was ran successfully.')
          .setColor("Random")
          // .setImage('https://i.giphy.com/HZrx8kjIA7lyeTqXVM.webp')
          .setTimestamp()
          // .setFooter({text :`Ran by: ${message.author.displayName}`, iconURL: message.author.avatarURL() })
          .setThumbnail('https://media.tenor.com/REoBdf2ztLEAAAAj/check-mark-good.gif')
          .setAuthor({name: 'Mauimatic' , iconURL: client.user.avatarURL()});
        message.reply({embeds: [embed]});
      }
    })
  }
};