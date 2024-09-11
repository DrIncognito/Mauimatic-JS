const { Events, MessageEmbed, EmbedBuilder } = require('discord.js');

module.exports = {
    setup(client) {
        client.on('messageCreate', async message => {
            if (message.author.bot) return;
            if (message.content === '!serverstats' && message.guild) { // Change '!serverstats' to your command trigger
                const guild = message.guild;

                // Create an embed message with server stats
                const embed = new EmbedBuilder()
                    .setTitle(`Server Stats for ${guild.name}`)
                    .addFields({name: 'Total Members', value:`${guild.memberCount}`})
                    .addFields({name: 'Online Members', value:`${guild.members.cache.filter(member => member.presence?.status === 'online').size}`})
                    .addFields({name: 'Total Channels', value:`${guild.channels.cache.size}`})
                    .addFields({name: 'Total Roles', value:`${guild.roles.cache.size}`})
                    .setColor('Random')
                    .setTimestamp();

                // Send the embed message
                await message.channel.send({ embeds: [embed] });
            } 
        });
    }
};
