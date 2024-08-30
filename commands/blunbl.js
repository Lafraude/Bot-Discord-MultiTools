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

// BlackList Commands

const blacklistFile = 'blacklist.json';
let blacklist = [];

if (fs.existsSync(blacklistFile)) {
  try {
    const data = fs.readFileSync(blacklistFile, 'utf8');
    blacklist = JSON.parse(data);
    if (!Array.isArray(blacklist)) {
      blacklist = [];
    }
  } catch (error) {
    console.error('Erreur lors du chargement du fichier de blacklist:', error);
    blacklist = [];
  }
} else {
  fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'blacklist') {

    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
    }

    const userI = options.getUser('user');

    if (!userI) {
      await interaction.reply({ content: 'Utilisateur non trouvé!', ephemeral: true });
      return;
    }

    const userId = userI.id;
    const userTag = userI.tag;

    // Ajouter l'utilisateur à la blacklist
    if (!blacklist.some(entry => entry.id === userId)) {
      blacklist.push({ id: userId, tag: userTag });
      fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));

      // Bannir l'utilisateur de tous les serveurs où le bot est présent
      client.guilds.cache.forEach(async (guild) => {
        try {
          await guild.members.ban(userId, { reason: 'Blacklisté' });
        } catch (error) {
          console.error(`Erreur lors du bannissement de ${userTag} dans ${guild.name}:`, error);
        }
      });

      await interaction.reply({ content: `${userTag} a été ajouté à la blacklist et banni de tous les serveurs.` });
    } else {
      await interaction.reply({ content: `${userTag} est déjà dans la blacklist.`, ephemeral: true });
    }
  }
  if (commandName === 'unblacklist') {
    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
    }
    const user = options.getUser('user');

    if (!user) {
      await interaction.reply({ content: 'Utilisateur non trouvé!', ephemeral: true });
      return;
    }

    const userId = user.id;
    const userTag = user.tag;

    // Retirer l'utilisateur de la blacklist
    const initialLength = blacklist.length;
    blacklist = blacklist.filter(entry => entry.id !== userId);

    if (blacklist.length < initialLength) {
      fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2));

      // Débannir l'utilisateur de tous les serveurs où le bot est présent
      client.guilds.cache.forEach(async (guild) => {
        try {
          await guild.members.unban(userId, 'Retiré de la blacklist par le bot');
        } catch (error) {
          console.error(`Erreur lors du débanissement de ${userTag} dans ${guild.name}:`, error);
        }
      });

      await interaction.reply({ content: `${userTag} a été retiré de la blacklist et débanni de tous les serveurs.` });
    } else {
      await interaction.reply({ content: `${userTag} n'est pas dans la blacklist.`, ephemeral: true });
    }
  }
});

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);