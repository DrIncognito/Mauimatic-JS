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
            if (Interaction.commandName === 'test') {
                await Interaction.reply({content:'Test Successful!'});
            }
        });
    }
}