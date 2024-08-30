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


// Assurez-vous que seul le dossier `events` est mentionné ici
const CONFIG_PATH = path.join(__dirname, 'log.json');

let logChannels = {
  roleLogsChannelId: null,
  sanctionLogChannelId: null,
  messageLogChannelId: null,
  voiceLogChannelId: null,
  délaiLogChannelId: null,
  joinLogChannelId: null,
  autreLogChannelId: null,
  canalLogChannelId: null,
};

// Fonction pour charger les IDs depuis le fichier de configuration si existant
const loadConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH);
      logChannels = JSON.parse(data);
  } else {
      // Créer un fichier vide si non existant
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(logChannels, null, 2));
  }
};

// Appeler cette fonction au démarrage pour charger les données
loadConfig();

const createLogChannels = async (interaction) => {
  try {
      // Répondre rapidement pour éviter l'erreur d'interaction inconnue
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;

      // Création de la catégorie 'log'
      const category = await guild.channels.create({
          name: '〔📁〕logs',
          type: 4, // Type 4 représente une catégorie
          permissionOverwrites: [
              {
                  id: guild.roles.everyone.id,
                  deny: ['ViewChannel'],
              },
          ],
      });

      // Création des salons dans la catégorie
      const channelNames = [
          '〔📁〕rôle-logs',
          '〔📁〕sanction-log',
          '〔📁〕message-log',
          '〔📁〕voice-log',
          '〔📁〕délai-log',
          '〔📁〕join-log',
          '〔📁〕autre-log',
          '〔📁〕canal-log',
      ];

      const channelPromises = channelNames.map((name) => 
          guild.channels.create({
              name: name,
              type: 0, // Type 0 représente un salon texte
              parent: category.id,
          })
      );

      const channels = await Promise.all(channelPromises);

      // Mise à jour des IDs dans la variable globale
      logChannels = {
          roleLogsChannelId: channels[0].id,
          sanctionLogChannelId: channels[1].id,
          messageLogChannelId: channels[2].id,
          voiceLogChannelId: channels[3].id,
          délaiLogChannelId: channels[4].id,
          joinLogChannelId: channels[5].id,
          autreLogChannelId: channels[6].id,
          canalLogChannelId: channels[7].id,
      };

      // Écriture dans un fichier de configuration pour persister les données
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(logChannels, null, 2));

      await interaction.editReply('Catégorie des logs créés avec succès.');
  } catch (error) {
      console.error('Erreur lors de la création de la catégorie de journal et des canaux :', error);
      await interaction.editReply('Une erreur s\'est produite lors de la création des logs.');
  }
};

// Événement lors de la réception d'une interaction
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'setup-log') {
      // Vérifie les permissions de l'utilisateur
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.'});
      }

      // Appelle la fonction pour créer les salons
      await createLogChannels(interaction);
  }
});

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);