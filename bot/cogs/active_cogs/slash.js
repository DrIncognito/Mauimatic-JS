const { Events } = require('discord.js');

module.exports = {
    setup (client) {
        client.on(Events.InteractionCreate, async Interaction => {
            if (!Interaction.isChatInputCommand()) return;

            if (Interaction.commandName === 'ping') {
                await Interaction.reply({content:'Pong!'});
            }
            if (Interaction.commandName === 'test') {
                await Interaction.reply({content:'Test Successful!'});
            }
        });
    }
}