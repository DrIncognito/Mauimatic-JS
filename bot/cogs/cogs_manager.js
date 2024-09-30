const { readdirSync, renameSync, existsSync } = require('fs');
const path = require('path');

// Authorized user ID(s)
const authorizedUsers = ['403036700152037377'];

// Directories
const activeCogsDir = path.join(__dirname, 'active_cogs');
const inactiveCogsDir = path.join(__dirname, 'inactive_cogs');

// Helper function to load a cog
function loadCog(client, cogName) {
  try {
    const cogPath = path.join(activeCogsDir, `${cogName}.js`);
    if (!existsSync(cogPath)) {
      return `Cog \`${cogName}\` does not exist in the active_cogs folder.`;
    }
    const cog = require(cogPath);
    if (cog.setup) {
      cog.setup(client);
      client.cogs.set(cogName, cog);
    }
    return `Cog \`${cogName}\` has been loaded.`;
  } catch (error) {
    console.error(`Failed to load cog ${cogName}:`, error);
    return `Failed to load cog \`${cogName}\`.`;
  }
}

// Helper function to unload a cog
function unloadCog(client, cogName, commands) {
  const cogPath = path.join(activeCogsDir, `${cogName}.js`);
  if (!existsSync(cogPath)) {
    return `Cog \`${cogName}\` is not active or doesn't exist.`;
  }

  // Unload the cog and remove it from client.cogs
  if (client.cogs.has(cogName)) {
    delete require.cache[require.resolve(cogPath)];
    client.cogs.delete(cogName);

    // Remove the command from the commands array if present
    const commandIndex = commands.findIndex(cmd => cmd.name === cogName);
    if (commandIndex !== -1) {
      commands.splice(commandIndex, 1); // Remove the command
    }

    return `Cog \`${cogName}\` has been unloaded and removed from commands.`;
  }
  return `Cog \`${cogName}\` is not loaded.`;
}

// Move cog file from one folder to another
function moveCog(cogName, fromDir, toDir) {
  const sourcePath = path.join(fromDir, `${cogName}.js`);
  const destPath = path.join(toDir, `${cogName}.js`);
  try {
    renameSync(sourcePath, destPath);
    return true;
  } catch (error) {
    console.error(`Failed to move cog ${cogName}:`, error);
    return false;
  }
}

module.exports = {
  name: 'cogs_manager',
  description: 'Manage cogs: load, unload, reload, etc.',
  category: 'Admin',
  aliases: ['cgm'],
  setup(client, commands) { // Pass commands as a parameter
    client.cogs = new Map(); // Store loaded cogs

    client.on('messageCreate', async message => {
      if (message.author.bot) return;

      const prefix = process.env.DISCORD_PREFIX || '!'; // Default prefix
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // Check if the command matches the main command or any alias
      const validCommands = [this.name, ...this.aliases];
      if (!validCommands.includes(command)) return;

      // Check if the user is authorized
      if (!authorizedUsers.includes(message.author.id)) {
        return message.reply("You don't have permission to manage cogs.");
      }

      const action = args[0]; // e.g., load, unload, reload
      const cogName = args[1]; // Cog name
      let response = '';

      // Validate action
      if (!action || !['load', 'unload', 'reload', 'reloadall'].includes(action)) {
        return message.reply("Usage: `!cogs_manager <load|unload|reload|reloadall> <cog_name>`");
      }

      // Process commands
      if (action === 'load') {
        if (existsSync(path.join(activeCogsDir, `${cogName}.js`))) {
          response = `Cog \`${cogName}\` is already active.`;
        } else if (!existsSync(path.join(inactiveCogsDir, `${cogName}.js`))) {
          response = `Cog \`${cogName}\` does not exist in the inactive_cogs folder.`;
        } else {
          if (moveCog(cogName, inactiveCogsDir, activeCogsDir)) {
            response = loadCog(client, cogName);
          } else {
            response = `Failed to move cog \`${cogName}\` to active_cogs.`;
          }
        }
      } if (action === 'unload') {
        if (!existsSync(path.join(activeCogsDir, `${cogName}.js`))) {
          response = `Cog \`${cogName}\` is not currently active.`;
        } else {
          // Attempt to unload the cog
          response = unloadCog(client, cogName, commands); // Pass commands array
          // Move the cog file to inactive_cogs
          if (moveCog(cogName, activeCogsDir, inactiveCogsDir)) {
            response += ` Cog \`${cogName}\` has been moved to inactive_cogs.`;
          } else {
            response += ` Failed to move cog \`${cogName}\` to inactive_cogs.`;
          }
        }    
      } else if (action === 'reload') {
        if (!existsSync(path.join(activeCogsDir, `${cogName}.js`))) {
          response = `Cog \`${cogName}\` is not currently active.`;
        } else {
          response = unloadCog(client, cogName);
          response += `\n${loadCog(client, cogName)}`;
        }
      } else if (action === 'reloadall') {
        const cogFiles = readdirSync(activeCogsDir).filter(file => file.endsWith('.js'));
        response = 'Reloading all active cogs:\n';
        for (const file of cogFiles) {
          const cogName = path.parse(file).name;
          response += `\n${unloadCog(client, cogName)}`;
          response += `\n${loadCog(client, cogName)}`;
        }
      }

      message.reply(response);
    });
  }
};
