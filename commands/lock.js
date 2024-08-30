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
  
    if(interaction.commandName === "lock"){
      var channel_id = interaction.options.get('channel_id').value
      var channel = interaction.guild.channels.cache.get(channel_id)
      if(channel){
        if(interaction.member.permissions.has(discord.PermissionFlagsBits.ManageChannels)){
          channel.lockPermissions()
          channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false })
          interaction.reply(`<#${channel.id}> a été verrouillée !\nAction effectuée par : ${interaction.member}\nRaison : ${interaction.options.getString('raison')}`)
        }
      }
      else{
        interaction.reply("Ce salon n'existe pas!")
      }};})

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);