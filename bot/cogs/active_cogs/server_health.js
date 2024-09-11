const { EmbedBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const prefix = process.env.DISCORD_PREFIX;

// Store server statistics
const serverStats = {};

module.exports = {
  setup(client) {
    client.on('messageCreate', async message => {
      if (message.author.bot) return;

      // Command handling
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // Command to display server health dashboard
      if (command === 'serverhealth') {
        await sendServerHealthDashboard(message);
      }
      
      // Command to trigger graphical reports
      if (command === 'report') {
        await sendGraphicalReport(message);
      }

      // Update server statistics
      updateServerStats(message);
    });
  }
};

// Update server statistics based on events
function updateServerStats(message) {
  const guild = message.guild;

  if (!serverStats[guild.id]) {
    serverStats[guild.id] = {
      messageCount: 0,
      memberJoinDates: new Map(),
      voiceActivity: {},
      lastUpdated: Date.now()
    };
  }

  const stats = serverStats[guild.id];

  // Update message count
  stats.messageCount++;

  // Track member join dates
  const member = guild.members.cache.get(message.author.id);
  if (member && !stats.memberJoinDates.has(member.id)) {
    stats.memberJoinDates.set(member.id, member.joinedTimestamp);
  }

  // Update voice channel activity
  guild.voiceStates.cache.forEach(voiceState => {
    if (!stats.voiceActivity[voiceState.channelId]) {
      stats.voiceActivity[voiceState.channelId] = 0;
    }
    stats.voiceActivity[voiceState.channelId]++;
  });

  // Update last updated timestamp
  stats.lastUpdated = Date.now();

  // Check for health alerts
  checkHealthAlerts(guild);
}

async function sendServerHealthDashboard(message) {
  const guild = message.guild;
  const stats = serverStats[guild.id];

  if (!stats) {
    return message.reply('No server statistics available. Please use the `report` command to generate data first.');
  }

  const totalMessages = stats.messageCount;
  const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
  const totalVoiceChannels = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size;
  const activeVoiceChannels = Object.keys(stats.voiceActivity).length;
  const retentionData = calculateRetention(guild);

  const embed = new EmbedBuilder()
    .setTitle(`Server Health Dashboard for ${guild.name}`)
    .addFields(
      { name: 'Total Messages', value: `${totalMessages}`, inline: true },
      { name: 'Online Members', value: `${onlineMembers}`, inline: true },
      { name: 'Voice Channels', value: `${totalVoiceChannels}`, inline: true },
      { name: 'Active Voice Channels', value: `${activeVoiceChannels}`, inline: true },
      { name: 'Retention Rate', value: retentionData, inline: true },
      { name: 'Server Created At', value: `${guild.createdAt.toDateString()}`, inline: true },
      { name: 'Last Updated', value: `<t:${Math.floor(stats.lastUpdated / 1000)}:R>`, inline: true }
    )
    .setColor('Random')
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function sendGraphicalReport(message) {
  const guild = message.guild;
  if (!serverStats[guild.id]) {
    return message.reply('No server statistics available. Please use the `serverhealth` command first.');
  }

  // Create a canvas with specified width and height
  const width = 800;
  const height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  // Define the chart configuration for message frequency
  const messageData = getMessageFrequencyData(guild);

  const configuration = {
    type: 'line',
    data: {
      labels: messageData.labels,
      datasets: [{
        label: 'Messages Per Day',
        data: messageData.values,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Render the chart to a buffer
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

  // Create an attachment from the buffer
  const attachment = new AttachmentBuilder(imageBuffer, 'message_frequency_chart.png');

  // Send the attachment in the message
  const embed = new EmbedBuilder()
    .setTitle('Server Activity Report')
    .setDescription('Here is the graphical report of server activity.')
    .setColor('Random')
    .setImage('attachment://message_frequency_chart.png')
    .setTimestamp();

  await message.reply({ embeds: [embed], files: [attachment] });
}

function getMessageFrequencyData(guild) {
  // Example data, replace with real logic for fetching message frequency data
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const values = [12, 19, 3, 5, 2]; // Example values, replace with actual message frequency data

  return { labels, values };
}

function calculateRetention(guild) {
  const stats = serverStats[guild.id];
  const currentTimestamp = Date.now();
  const retentionThresholdDays = 30;

  let retainedMembers = 0;
  let totalNewMembers = 0;

  stats.memberJoinDates.forEach((joinDate, memberId) => {
    const daysSinceJoin = (currentTimestamp - joinDate) / (1000 * 60 * 60 * 24);
    if (daysSinceJoin <= retentionThresholdDays) {
      retainedMembers++;
    }
    totalNewMembers++;
  });

  const retentionRate = totalNewMembers > 0 ? (retainedMembers / totalNewMembers) * 100 : 0;
  return `${Math.round(retentionRate)}%`;
}

function checkHealthAlerts(guild) {
  const stats = serverStats[guild.id];

  // Define alert thresholds
  const messageThreshold = 5;
  const voiceChannelThreshold = 0;

  if (stats.messageCount < messageThreshold) {
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.permissionsFor(guild.me).has(PermissionsBitField.Flags.SendMessages));
    if (channel) {
      channel.send(`🚨 **Alert** 🚨: The number of messages in the server is below the threshold of ${messageThreshold}. Current count: ${stats.messageCount}`);
    }
  }

  const activeVoiceChannels = Object.keys(stats.voiceActivity).length;
  if (activeVoiceChannels < voiceChannelThreshold) {
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.permissionsFor(guild.me).has(PermissionsBitField.Flags.SendMessages));
    if (channel) {
      channel.send(`🚨 **Alert** 🚨: The number of active voice channels is below the threshold of ${voiceChannelThreshold}. Current count: ${activeVoiceChannels}`);
    }
  }
}
