const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
const path = require('path');
const config = require("./config");
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildScheduledEvents
    ],
    
  });

client.on('interactionCreate', async interaction => {
    if(interaction.commandName ==='setup-welcome'){
        const channelId = interaction.options.getChannel('channel').id;
        const roleId = interaction.options.getRole('role').id;
        // Sauvegarde l'id du salon dans le json config
        fs.readFile('./config.json', 'utf8', (err, jsonString) => {
          if (err) {
            console.error('Error reading JSON file:', err);
            return;
          }
          let jsonData = JSON.parse(jsonString);
          jsonData.welcome_channel_id = channelId;
          jsonData.welcome_role_id = roleId;
          fs.writeFile('./config.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
              return;
            }
          });
        });
        interaction.reply({ embeds : [{
          title: "",
          description: "**Le salon de bienvenue & le message & le role ont été mis à jour avec succès!**",
          color: 0x00ff00,
        }], ephemeral : true,
  
    })
  }})

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);