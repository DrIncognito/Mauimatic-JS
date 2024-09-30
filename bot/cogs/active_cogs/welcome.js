const { EmbedBuilder } = require('discord.js');
const WELCOME_CHANNEL = process.env.WELCOME_CHANNEL

module.exports = {
  name: 'Welcome',
  description: 'Displays a welcome message and assigns a default role to new members.',
  usage: '[command name]',
  category: 'Utility',
  setup(client) {
    client.on('guildMemberAdd', async member => {
      // Send a welcome message
      const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === WELCOME_CHANNEL);
      if (welcomeChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Welcome!')
          .setDescription(`Hello, ${member.user}! Welcome to ${member.guild.name}.`)
          .setColor("Random")
          .setThumbnail(member.user.avatarURL())
          .setTimestamp()
          .setAuthor({ name: 'Mauimatic', iconURL: client.user.avatarURL() });
        welcomeChannel.send({ embeds: [embed] });
      }

      // Assign a default role
      const defaultRole = member.guild.roles.cache.find(role => role.name === 'Guest');
      if (defaultRole) {
        member.roles.add(defaultRole).catch(console.error);
      }
    })
}
};