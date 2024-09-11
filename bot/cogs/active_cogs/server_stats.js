const { Events, MessageEmbed, EmbedBuilder } = require('discord.js');

module.exports = {
    setup(client) {
        client.on('messageCreate', async message => {
            if (message.author.bot) return;
            if (message.content === '!serverstats' && message.guild) { // Change '!serverstats' to your command trigger
                const guild = message.guild;
                const member_online = guild.members.cache.filter(member => member.presence?.status === 'online').size
                const total_members = guild.memberCount;
                const members_percentage = (member_online / total_members) * 100;
                // Create an embed message with server stats
                const embed = new EmbedBuilder()
                    .setTitle(`Stats for ${guild.name}`)
                    .addFields(
                        { name: 'Online Members', value: `${member_online}`, inline: true },
                        { name: 'Total Members', value: `${total_members}`, inline: true },
                        { name: 'Online %', value: `${Math.round(members_percentage)}%`, inline: false }
                        { name: 'Total Channels', value: `${guild.channels.cache.size}`, inline: false },
                        { name: 'Total Roles', value: `${guild.roles.cache.size}`, inline: false },
                        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: false },
                        { name: 'AFK Timeout', value: `${guild.afkTimeout / 60} minutes`, inline: false },
                        { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: false },
                        { name: 'Verification Level', value: `${guild.verificationLevel}`, inline: false },
                        { name: 'Server Created At', value: `${guild.createdAt.toDateString()}`, inline: false }
                    )
                    .setColor('Random')
                    .setTimestamp();

                // Send the embed message
                await message.channel.send({ embeds: [embed] });
            } 
        });
    }
};
