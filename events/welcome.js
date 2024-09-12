const fs = require('fs');
const config = require("../config.json");
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
const path = require('path');
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

client.on('guildMemberAdd', member => {

    client.channels.cache.get(config.welcome_channel_id).send({ embeds : [{
      title: "Bienvenue sur le serveur!",
      description: `<@${member.id}> vient de rejoindre. Nous sommes désormais **${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}** sur le serveur !`,
      color: 0xFFFFFF,
      fields: [
        {
          name: "",
          value: ``
        }
      ],
      //avatar du serveur 
      thumbnail: {
        url: member.guild.iconURL()
      }
    }] }).catch(err => { console.error('Aucun salon de set') })
    member.roles.add(config.welcome_role_id).catch(err => { console.error('Aucun rôle de set') })
  
  })

client.login(config.token)
  .catch(console.error);
