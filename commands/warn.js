const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
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

// Warn 
let warns = {};

// Charger les warns depuis le fichier warn.json
if (fs.existsSync('warn.json')) {
    warns = JSON.parse(fs.readFileSync('warn.json', 'utf-8'));
}

// Sauvegarder les warns dans le fichier warn.json
function saveWarns() {
    fs.writeFileSync('warn.json', JSON.stringify(warns, null, 4));
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'warn-add') {
    // Perm pour kick sinon on peut pas utiliser la commande
    if (!interaction.member.permissions.has(discord.PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
    }
      const user = options.getUser('user');
      const reason = options.getString('reason');
      const warnId = uuidv4().slice(0, 6);

      if (!warns[user.id]) {
          warns[user.id] = [];
      }

      warns[user.id].push({ id: warnId, reason: reason });
      saveWarns();

      await interaction.reply(`Avertissement ajouté pour <@${user.id}> avec l'ID **${warnId}.**`);
  } else if (commandName === 'warn-remove') {
    if (!interaction.member.permissions.has(discord.PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
      return;
    }
      const warnId = options.getString('warn_id');
      let removed = false;

      for (const userId in warns) {
          const index = warns[userId].findIndex(warn => warn.id === warnId);
          if (index !== -1) {
              warns[userId].splice(index, 1);
              if (warns[userId].length === 0) {
                  delete warns[userId];
              }
              saveWarns();
              removed = true;
              break;
          }
      }

      if (removed) {
          await interaction.reply(`Avertissement avec l'ID **${warnId}** retiré.`);
      } else {
          await interaction.reply(`Aucun avertissement trouvé avec l'ID **${warnId}**.`);
      }
  } else if (commandName === 'warn-list') {
    if (!interaction.member.permissions.has(discord.PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
      return;
    }
      const user = options.getUser('user');
      const userWarns = warns[user.id];

      if (!userWarns || userWarns.length === 0) {
          await interaction.reply(`<@${user.id}> n'a pas d'avertissements.`);
          return;
      }

      const embed = new discord.EmbedBuilder()
          .setTitle(`Voici les avertissements pour ${user.tag}`)
          .setColor(0xff0000)
          .setTimestamp();

      userWarns.forEach(warn => {
          embed.addFields({ name: `ID: **${warn.id}**`, value: `Raison: ${warn.reason}`, inline: false });
      });

      await interaction.reply({ embeds: [embed] });
  }
});

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);