const { EmbedBuilder } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
const prefix = process.env.DISCORD_PREFIX;

// Function to dynamically load commands from the 'active_cogs' folder
function loadCommands(directory) {
  const commands = [];

  // Read all files from the directory
  const commandFiles = readdirSync(directory).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    // Exclude 'help.js' from being loaded
    if (file === 'help.js') continue;

    // Dynamically require each command
    const command = require(path.join(directory, file));

    // Ensure each command has the necessary metadata
    if (command.name && command.description && command.category) {
      commands.push({
        name: command.name,
        description: command.description,
        usage: command.usage || '', // Optional usage
        category: command.category
      });
    } else {
      console.error(`Command file ${file} is missing required properties.`);
    }
  }

  return commands;
}

// Load commands from the 'active_cogs' folder
const commands = loadCommands(path.join(__dirname, '/'));

// Function to group commands by category
function groupCommandsByCategory(commands) {
  const grouped = {};

  commands.forEach(cmd => {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  });

  return grouped;
}

// Help command definition
module.exports = {
  name: 'help',
  description: 'Displays a list of available commands or detailed info for a specific command.',
  usage: '[command name]',
  category: 'Utility',
  setup(client) {
    client.on('messageCreate', async message => {
      if (message.author.bot) return;

      // Check if the message starts with the prefix
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (commandName === 'help') {
        // If no specific command is requested, show a list of all available commands
        if (!args.length) {
          const groupedCommands = groupCommandsByCategory(commands);
          const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setThumbnail(`https://i.giphy.com/xeAdIDsHwRCF2.gif`)
            .setDescription('Here are the available commands, sorted by category:')
            .setColor('Random')
            .setTimestamp();

          // Add commands grouped by category to the embed
          for (const category in groupedCommands) {
            const commandList = groupedCommands[category]
              .map(cmd => `\`${prefix}${cmd.name}\`: ${cmd.description}`)
              .join('\n');
            
            embed.addFields({ name: category, value: commandList, inline: false });
          }

          // Send the embed with all commands grouped by category
          return message.reply({ embeds: [embed] });
        }

        // If a specific command is requested, show detailed info for that command
        const requestedCommand = commands.find(cmd => cmd.name === args[0].toLowerCase());

        if (!requestedCommand) {
          return message.reply(`Command \`${args[0]}\` not found.`);
        }

        const detailedEmbed = new EmbedBuilder()
          .setTitle(`Help: ${prefix}${requestedCommand.name}`)
          .setThumbnail(`https://i.giphy.com/xeAdIDsHwRCF2.gif`)
          .addFields(
            { name: 'Description', value: requestedCommand.description || 'No description provided.' },
            { name: 'Usage', value: `\`${prefix}${requestedCommand.name} ${requestedCommand.usage || ''}\`` },
            { name: 'Category', value: requestedCommand.category || 'Miscellaneous' }
          )
          .setColor('Random')
          .setTimestamp();

        // Send the detailed embed for the specific command
        return message.reply({ embeds: [detailedEmbed] });
      }
    });
  }
};
