const fs = require('fs');

// Function to load all cogs from a folder (active or inactive)
async function loadCogsFromFolder(status, client) {
  const cogData = JSON.parse(fs.readFileSync('./bot/cogs.json', 'utf-8'));
  const cogList = cogData[status];

  for (let cogName of cogList) {
    try {
      const cogModule = require(`./cogs/${status}/${cogName}.js`);
      client.commands.set(cogModule.data.name, cogModule);
    } catch (error) {
      console.error(`Failed to load ${cogName} from ${status} folder`, error);
    }
  }
}

// Function to load a cog from the inactive folder and move to active
async function loadCog(cogName, client) {
  const cogData = JSON.parse(fs.readFileSync('./bot/cogs.json', 'utf-8'));

  if (cogData.inactive.includes(cogName)) {
    try {
      const cogModule = require(`./cogs/inactive/${cogName}.js`);
      client.commands.set(cogModule.data.name, cogModule);

      // Move cog to active
      cogData.inactive = cogData.inactive.filter(c => c !== cogName);
      cogData.active.push(cogName);
      fs.writeFileSync('./bot/cogs.json', JSON.stringify(cogData, null, 2));

      return true;
    } catch (error) {
      console.error(`Failed to load cog: ${cogName}`, error);
      return false;
    }
  }
  return false;
}

// Function to unload a cog from active and move to inactive
async function unloadCog(cogName, client) {
  const cogData = JSON.parse(fs.readFileSync('./bot/cogs.json', 'utf-8'));

  if (cogData.active.includes(cogName)) {
    // Remove cog from the client's commands
    client.commands.delete(cogName);

    // Move cog to inactive
    cogData.active = cogData.active.filter(c => c !== cogName);
    cogData.inactive.push(cogName);
    fs.writeFileSync('./bot/cogs.json', JSON.stringify(cogData, null, 2));

    return true;
  }
  return false;
}

module.exports = {
  loadCogsFromFolder,
  loadCog,
  unloadCog
};
