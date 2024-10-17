const { Client, GatewayIntentBits, Partials, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json')
const configPath = path.join(__dirname, 'welcomeConfig.json');

let welcomeConfig = {
    enabled: false,
    channelId: null,
    welcomeTitle: '',
    welcomeMessage: '', 
    includeServerLogo: false,
};

if (fs.existsSync(configPath)) {
    welcomeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(welcomeConfig, null, 4), 'utf-8');
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel],
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'welcome-setup') {
        const activate = interaction.options.getBoolean('activate');
        const channel = interaction.options.getChannel('channel');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({ content: "Veuillez spécifier un salon textuel valide.", ephemeral: true });
        }

        welcomeConfig.enabled = activate;
        welcomeConfig.channelId = channel.id;

        saveConfig(); 

        if (!activate) {
            return interaction.reply({ content: `Le système de bienvenue est désactivé pour le salon ${channel}.`, ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('welcomeModal')
            .setTitle('Configuration du message de bienvenue');

        const titleInput = new TextInputBuilder()
            .setCustomId('welcomeTitle')
            .setLabel('Titre du message de bienvenue')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId('welcomeMessage')
            .setLabel('Message de bienvenue')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const logoInput = new TextInputBuilder()
            .setCustomId('includeServerLogo')
            .setLabel('Inclure le logo du serveur ? (oui/non)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(messageInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(logoInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'welcomeModal') {
        const title = interaction.fields.getTextInputValue('welcomeTitle');
        const message = interaction.fields.getTextInputValue('welcomeMessage');
        const includeLogo = interaction.fields.getTextInputValue('includeServerLogo').toLowerCase() === 'oui';

        welcomeConfig.welcomeTitle = title;
        welcomeConfig.welcomeMessage = message;
        welcomeConfig.includeServerLogo = includeLogo;

        saveConfig();

        await interaction.reply({ content: 'Le message de bienvenue a été configuré avec succès!', ephemeral: true });
    }
});

client.on('guildMemberAdd', async member => {
    if (!welcomeConfig.enabled || !welcomeConfig.channelId) return;

    const welcomeChannel = member.guild.channels.cache.get(welcomeConfig.channelId);
    if (!welcomeChannel) return;

    let message = welcomeConfig.welcomeMessage
        .replace(/\$user/g, member.user.id)
        .replace(/\$numbermembre/g, member.guild.memberCount);

    const embed = new EmbedBuilder()
        .setTitle(welcomeConfig.welcomeTitle)
        .setDescription(message)
        .setColor('#5dade2')
        .setTimestamp();

    if (welcomeConfig.includeServerLogo) {
        embed.setThumbnail(member.guild.iconURL());
    }

    welcomeChannel.send({ embeds: [embed] });
});
client.once('ready', async () => {
    const guild = client.guilds.cache.get(config.guildId); 
    await guild.commands.create(
        new SlashCommandBuilder()
            .setName('welcome-setup')
            .setDescription('Configurer le système de bienvenue')
            .addBooleanOption(option => option
                .setName('activate')
                .setDescription('Activer ou désactiver le système de bienvenue')
                .setRequired(true))
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Choisir le salon où envoyer les messages de bienvenue')
                .setRequired(true))
    );
});

client.login(config.token);
