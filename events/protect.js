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
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

// LA COMMANDE ANTI RAID //
client.on('interactionCreate', async interaction => {
    if(interaction.commandName ==='setup-antiraid'){

      // Seul les personnes qui ont les perm admin peuvent utilisé la commande 
      if(!interaction.member.permissions.has('Administrator')){
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
      }

      // crée un salon antiraid
      const antiraidChannel = await interaction.guild.channels.create({
        name: "💾｜antiraid",
        type: 0,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: "ViewChannel"
          }
        ]
      });
      interaction.reply({ embeds : [{
        title: "",
        description: "**Le salon antiraid a été créé avec succès !**",
        color: 0x00ff00,
      }], ephemeral: true});


      // Sauvegarde l'id dans le json config 

      fs.readFile('./config.json', 'utf8', (err, jsonString) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          return;
        }
        let jsonData = JSON.parse(jsonString);
        jsonData.antiraid_channel_id = antiraidChannel.id;
        fs.writeFile('./config.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error writing JSON file:', err);
            return;
          }
        });
      })

      await new Promise(resolve => setTimeout(resolve, 3000));
      // Envoyer un message dans le salon comme quoi tout a était config 
      antiraidChannel.send({ embeds : [{
        title: "Système Anti-Raid",
        description: "Le système anti-raid a été configuré avec succès !",
        color: 0x00ff00,
      }]});
    }
})

// LE SYSTEME ANTIRAID //

let channelCreationTracker = {};
const TIME_LIMIT = 4000;
const CHANNEL_CREATION_LIMIT = 4;

client.on('channelCreate', async (channel) => {
  const now = Date.now();

  try {
    const guild = channel.guild;
    const auditLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: 1,
    });

    const creationLog = auditLogs.entries.first();
    if (creationLog) {
      const { executor } = creationLog;
      if (executor.bot) {

        if (!channelCreationTracker[executor.id]) {
          channelCreationTracker[executor.id] = [];
        }

        channelCreationTracker[executor.id].push(now);

        channelCreationTracker[executor.id] = channelCreationTracker[executor.id].filter(
          (timestamp) => now - timestamp < TIME_LIMIT
        );

        // Vérifier si le nombre de créations dépasse la limite
        if (channelCreationTracker[executor.id].length >= CHANNEL_CREATION_LIMIT) {
          console.log(`Bot ${executor.tag} has created ${channelCreationTracker[executor.id].length} channels in less than 4 seconds.`);

          // Bannir le bot
          const botMember = guild.members.cache.get(executor.id);
          let banMessage = `Alerte : Le bot ${executor.tag} (ID: ${executor.id}) a été banni pour avoir créé ${channelCreationTracker[executor.id].length} salons en moins de quatre secondes.`;

          
          


          if (botMember) {
            try {
              await botMember.ban({ reason: 'AntiMassCreate - AutoMod' });

              await client.channels.cache.get(config.antiraid_channel_id).send({ embeds : [{
                title: "Protection Anti-Raid",
                description: "",
                color: 0xff0000,
                fields: [
                  {
                    name: "Le bot :",
                    value: '<@' + executor.id + '>',
                    inline: true,
                  },
                  {
                    name: "A t'il était ban ? ",
                    value: '✅',
                    inline: true,
                  },
                  {
                    name: "Raison :",
                    value: '```' + 'Création excessive de salons' + '```',
                  }
                ],
              }]});


            } catch (banError) {
              console.error(`Failed to ban bot ${executor.tag}:`, banError);
              banMessage = `Alerte : Le bot ${executor.tag} (ID: ${executor.id}) n'a pas pu être banni. Il a créé ${channelCreationTracker[executor.id].length} salons.`;
            }
          }
          channelCreationTracker[executor.id] = [];
        }
      }
    } else {
      console.error('No audit log entry found');
    }
  } catch (error) {
    logger.error(error.message)
    console.error('Erreur lors de la récupération des logs d’audit:', error);
  }
});

// ANTILINK 

const blacklist_mot = ['.gg', 'discord.gg', 'invite', '.gg/'];

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const containsBlacklistedWord = (content) => {
      return blacklist_mot.some(word => content.toLowerCase().includes(word.toLowerCase()));
  };

  const inviteRegex = /(https?:\/\/)+/g;

  if (inviteRegex.test(message.content)) {
      if (!message.member.permissions.has('Administrator')) {
          message.delete()
              .then(() => {
                  message.channel.send(`${message.author}, vous n'avez pas la permission d'envoyer des liens !`)
                      .then(msg => {
                          setTimeout(() => msg.delete(), 5000); 
                      })
                      .catch(err => console.error('Erreur lors de la suppression du message d\'avertissement:', err));
              })
              message.member.kick('AntiLink - AutoMod')
              .catch(err => console.error('Erreur lors de la suppression du message:', err));
          return;
      }
  }

  if (containsBlacklistedWord(message.content)) {
      if (!message.member.permissions.has('Administrator')) {
          message.delete()
              .then(() => {
                  message.channel.send(`${message.author}, vous n'avez pas la permission d'envoyer des liens d'invitation Discord.`)
                      .then(msg => {
                          setTimeout(() => msg.delete(), 5000);
                      })
                      .catch(console.error('Erreur lors de la suppression du message d\'avertissement:', err));
              })
              message.member.kick('AntiLink - AutoMod')
              .catch(console.error('Erreur lors de la suppression du message:', err));
          return;
      }
  } else { console.error(`${YELLOW} Message détécter (Détection automatique (AntiLink protect))${RESET}`) }
});

client.login(config.token)
    .catch(error => console.error("Erreur sur le token:", error));
