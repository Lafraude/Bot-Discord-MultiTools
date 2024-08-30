const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
const config = require("./config");
const path = require('path');
const axios = require('axios'); 
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


// Emoji-add

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    const { commandName } = interaction;
  
    if (commandName === 'emoji-add') {
  
      // 00100000000000000000000000000000 = CREATE_GUILD_EXPRESSIONS
  
  
      if (!interaction.member.permissions.has('00100000000000000000000000000000')) {
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
  
      }
  
        const emojiInput = interaction.options.getString('emoji');
  
        const emojiRegex = /<a?:\w+:(\d+)>/;
        const match = emojiInput.match(emojiRegex);
  
        if (!match) {
            return interaction.reply({ content: 'Seuls les emojis personnalisés peuvent être copiés.', ephemeral: true });
        }
  
        const emojiId = match[1];
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${match[0].startsWith('<a:') ? 'gif' : 'png'}`;
        const fileExtension = match[0].startsWith('<a:') ? '.gif' : '.png';
        const filePath = path.join(__dirname, `emoji${fileExtension}`);
  
        try {
            const response = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, response.data);
            const newEmoji = await interaction.guild.emojis.create({
                attachment: filePath,
                name: match[0].split(':')[1]
            });
            fs.unlinkSync(filePath);
  
            interaction.reply({ content: `Emoji ajouté avec succès : ${newEmoji}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Erreur lors de l\'ajout de l\'emoji.', ephemeral: true });
        }
    }
  });

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);