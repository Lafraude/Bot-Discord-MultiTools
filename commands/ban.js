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
  
    if (interaction.commandName === "ban"){
      var target = interaction.options.get('target').value
      var member = interaction.guild.members.cache.get(target)
      if(member.bannable){
        if(interaction.member.permissions.has(discord.PermissionFlagsBits.BanMembers)){
          member.ban({ reason: interaction.options.getString('raison')  })
          interaction.reply({ embeds : [
            {
              title: 'Ban',
              description: ``,
              fields: [
                {
                  name: 'Utilisateur banni',
                  value: `<@${member.user.id}>`,
                  inline: true,
                },
                {
                  name: 'Action effectuée par :',
                  value: `${interaction.member}`,
                  inline: true,
                },
                {
                  name: 'Raison',
                  value: '```' + `${interaction.options.getString('raison')}` + '```',
                },
              ]
            }
          ]})
  }} else {
    interaction.reply("Ce membre ne peut pas être banni !")
  }}})

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);