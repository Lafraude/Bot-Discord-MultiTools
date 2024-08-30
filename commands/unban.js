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
    if (interaction.user.bot) return;
    
    if (interaction.commandName === "unban") {
      if (!interaction.member.permissions.has('BanMembers')) {
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
  
      }
  
      const target = interaction.options.getUser('user_id');
      const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
  
      try {
        await interaction.guild.members.unban(target.id, reason);
  
        await interaction.reply({ 
          embeds: [
            {
              title: 'Unban',
              description: '',
              fields: [
                {
                  name: 'Utilisateur unban',
                  value: `<@${target.id}>`,
                  inline: true,
                },
                {
                  name: 'Action effectuée par :',
                  value: `${interaction.member}`,
                  inline: true,
                },
              ]
            }
          ]
        });
      } catch (error) {
        console.error('Error unbanning user:');
        await interaction.reply({ content: 'L\'utilisateur n\'est pas ban.', ephemeral: true });
      }
    }
  });

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);