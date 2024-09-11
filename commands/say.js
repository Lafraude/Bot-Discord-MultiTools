const discord = require("discord.js");
const config = require('./config.json')
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
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
client.setMaxListeners(Infinity)


const prefix = "!";

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'say') {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.');
        }
        try {
            await message.delete();
        } catch (error) {
            console.error('Erreur lors de la suppression du message:', error);
        }
        const textToSay = args.join(' ');
        if (textToSay) {
            try {
                await message.channel.send(textToSay);
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message:', error);
            }
        } else {
            message.channel.send("Vous devez écrire un message après !say.");
        }
    }
});




client.login(config.token)
  .catch("Erreur sur le token" + console.error);