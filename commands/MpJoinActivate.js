const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");
// Chemin du fichier JSON pour stocker l'état d'activation
const configPath = './commands/mpjoinConfig.json';
const { Modal, TextInputComponent, showModal } = require('discord-modals'); // Assurez-vous que ce chemin est correct
const { Client, GatewayIntentBits, Collection } = require('discord.js');
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
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'mpjoinactivate') {
            const etat = interaction.options.getBoolean('etat');
            await interaction.reply({ content: '🔄 Configuration en cours...', ephemeral: true });
            const config = JSON.parse(fs.readFileSync(configPath));
            config.active = etat;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            await interaction.followUp({ content: `MP pour les nouveaux membres est maintenant ${etat ? 'activé' : 'désactivé'}.`, ephemeral: true });
        } else if (commandName === 'mpjoinconfig') {
            const modal = new Modal()
                .setCustomId('mpjoinconfigModal')
                .setTitle('Configurer le message de MP')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('messageInput')
                        .setLabel('Message de bienvenue')
                        .setStyle(2)
                        .setPlaceholder('Entrez le message ici...')
                        .setRequired(true)
                );
            await showModal(modal, { client: interaction.client, interaction });
        }
    }

    if (interaction.isModalSubmit()) {
        const { customId } = interaction;
        if (customId === 'mpjoinconfigModal') {
            const message = interaction.fields.getTextInputValue('messageInput');
            const config = JSON.parse(fs.readFileSync(configPath));
            config.message = message;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            const response = await interaction.reply({ content: '✅ Configuration terminée !', ephemeral: true});
        }
    }
});

client.on('guildMemberAdd', async member => {
    const config = JSON.parse(fs.readFileSync(configPath));
    if (config.active && config.message) {
        try {
            await member.send(config.message);
            console.log(`Message envoyé à ${member.user.tag}`);
        } catch (error) {
            console.error(`Impossible d'envoyer un message à ${member.user.tag}.`, error);
        }
    }
});


// NE PAS MODIFIER
client.login(config.token)
  .catch("Erreur sur le token" + console.error);