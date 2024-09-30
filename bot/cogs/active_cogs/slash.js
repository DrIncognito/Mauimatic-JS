const { Events } = require('discord.js');

module.exports = {
    name: 'Slash Commands',
    description: 'Various slash commands for the bot.',
    usage: '[command name]',
    category: 'Utility',
    setup (client) {
        client.on(Events.InteractionCreate, async Interaction => {
            if (!Interaction.isChatInputCommand()) return;

            if (Interaction.commandName === 'ping') {
                const sent = Date.now();
                await Interaction.reply({ content: 'Pong!' });
                const timeTaken = Date.now() - sent;
                await Interaction.editReply({ content: `:ping_pong: Pong! \nLatency ${timeTaken}ms.` });
            }
            if (Interaction.commandName === 'bot_invite') {
                await Interaction.reply({content:'[Invite Link](https://discord.com/api/oauth2/authorize?client_id=868115155760873513&permissions=8&scope=bot%20applications.commands)'});
            }
            if (Interaction.commandName === 'server_invite') {
                await Interaction.reply({content:'[Invite Link](https://discord.gg/KkfHg9REbW)'});
            }            
        });
    }
}