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

    if(interaction.user.bot)return;
    
    if(interaction.commandName === "kick"){
      var target = interaction.options.get('target').value
      var member = interaction.guild.members.cache.get(target)
      if(member.kickable){
        if(interaction.member.permissions.has((discord.PermissionFlagsBits.KickMembers))) {
          member.kick()
          interaction.reply(`${member.user.username} a été kick du serveur!`)
        }
      }
      else{
        interaction.reply("Ce membre ne peut pas être kick!")
      }};})

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);