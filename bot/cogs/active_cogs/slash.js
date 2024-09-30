const { Events } = require('discord.js');

module.exports = {
    setup (client) {
        client.on(Events.InteractionCreate, async Interaction => {
            if (!Interaction.isChatInputCommand()) return;

            if (Interaction.commandName === 'ping') {
                const sent = Date.now();
                await Interaction.reply({ content: 'Pong!' });
                const timeTaken = Date.now() - sent;
                await Interaction.editReply({ content: `:ping_pong: Pong! \nLatency ${timeTaken}ms.` });
            }
            if (Interaction.commandName === 'invite') {
                await Interaction.reply({content:'[Invite Link](https://discord.com/api/oauth2/authorize?client_id=868115155760873513&permissions=8&scope=bot%20applications.commands)'});
            }
        });
    }
}