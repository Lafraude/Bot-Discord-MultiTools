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



// GIVEAWAY 
const GIVEAWAYS_FILE = path.join(__dirname, 'giveaways.json');
const PARTICIPANTS_FILE = path.join(__dirname, 'participants.json');
const REROLLS_FILE = path.join(__dirname, 'rerolls.json');

client.on('ready', () => {
    // Charger les giveaways actifs et recréer les timers
    const giveaways = loadGiveaways();
    const now = Date.now();
    
    giveaways.forEach(giveaway => {
        const timeLeft = giveaway.endTime - now;
        if (timeLeft > 0) {
            setTimeout(() => endGiveaway(giveaway.id), timeLeft);
        } else if (!giveaway.ended) {
            // Si le giveaway est déjà terminé mais n'a pas été clôturé, on le clôture immédiatement
            endGiveaway(giveaway.id);
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'giveaway') {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
        }

        const prize = options.getString('prize');
        const duration = options.getInteger('duration');
        const winners = options.getInteger('winners');
        const endTime = Date.now() + duration * 60000;

        const giveawayId = generateUniqueId();

        const embed1 = new discord.EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(`\nRécompense: **${prize}**\nNombre de participants: 0\nNombre de gagnants: ${winners}\n\nLe giveaway prendra fin <t:${Math.floor(endTime / 1000)}:R>.`)
            .setFooter({ text: `Giveaway ID: ${giveawayId}` })
            .setColor(0xffcc00);
        const row = new discord.ActionRowBuilder()
            .addComponents(
                new discord.ButtonBuilder()
                    .setCustomId('participate1')
                    .setLabel('🎉 Participer')
                    .setStyle(1),
            );

        try {
            const message = await interaction.reply({ embeds: [embed1], components: [row], fetchReply: true });
            saveGiveaway(giveawayId, message.id, interaction.channel.id, endTime, prize, winners, false);
            setTimeout(() => endGiveaway(giveawayId), duration * 60000);
        } catch (error) {
            console.error('Error sending giveaway message:', error);
        }
    }

    if (commandName === 'reroll') {
        const giveawayId = options.getString('giveaway_id');
        const giveaway = getGiveaway(giveawayId);

        if (!giveaway) {
            return interaction.reply({ content: 'Giveaway introuvable.', ephemeral: true });
        }

        const participants = getParticipants(giveawayId);
        if (participants.length === 0) {
            return interaction.reply({ content: 'Aucun participant pour ce giveaway.', ephemeral: true });
        }

        const winnerId = participants[Math.floor(Math.random() * participants.length)];
        const winnerMention = `<@${winnerId}>`;

        const rerollResult = { giveawayId, winnerId, timestamp: Date.now() };
        saveReroll(rerollResult);

        const rerollEmbed = new discord.EmbedBuilder()
            .setTitle('🎉 Giveaway Reroll 🎉')
            .setDescription(`Nouveau gagnant: ${winnerMention}\nRécompense: **${giveaway.prize}**`)
            .setFooter({ text: `Giveaway ID: ${giveawayId}` });

        try {
            await interaction.reply({ embeds: [rerollEmbed] });
            setTimeout(() => deleteRerollResult(rerollResult), 48 * 60 * 60 * 1000); // Supprimer après 48h
        } catch (error) {
            console.error('Error sending reroll message:', error);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'participate1') {
        const message = interaction.message;
        const embed1 = message.embeds[0];

        if (!embed1 || !embed1.footer || !embed1.footer.text.startsWith('Giveaway ID:')) return;

        const userId = interaction.user.id;
        const giveawayId = embed1.footer.text.split(' ')[2];

        const participants = getParticipants(giveawayId);
        if (participants.includes(userId)) {
            await interaction.reply({ content: 'Vous êtes déjà inscrit à ce giveaway.', ephemeral: true });
            return;
        }

        participants.push(userId);
        saveParticipants(giveawayId, participants);

        const participantsCount = participants.length;
        const newDescription = embed1.description.replace(/Nombre de participants: \d+/, `Nombre de participants: ${participantsCount}`);

        const newEmbed = new discord.EmbedBuilder(embed1).setDescription(newDescription);

        try {
            await interaction.message.edit({ embeds: [newEmbed] });
            await interaction.reply({ content: 'Votre participation a été enregistrée!', ephemeral: true });
        } catch (error) {
            console.error('Error updating message:', error);
        }
    }
});

function generateUniqueId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function saveGiveaway(id, messageId, channelId, endTime, prize, winners, ended) {
    let giveaways = loadGiveaways();

    giveaways.push({ id, messageId, channelId, endTime, prize, winners, ended });
    fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2));
}

function loadGiveaways() {
    if (fs.existsSync(GIVEAWAYS_FILE)) {
        try {
            const data = fs.readFileSync(GIVEAWAYS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading giveaways file:', error);
            return [];
        }
    }
    return [];
}

function getGiveaway(giveawayId) {
    const giveaways = loadGiveaways();
    return giveaways.find(g => g.id === giveawayId) || null;
}

function getParticipants(giveawayId) {
    let participants = {};
    if (fs.existsSync(PARTICIPANTS_FILE)) {
        try {
            const data = fs.readFileSync(PARTICIPANTS_FILE, 'utf8');
            participants = JSON.parse(data);
        } catch (error) {
            console.error('Error reading participants file:', error);
            participants = {};
        }
    }
    return participants[giveawayId] || [];
}

function saveParticipants(giveawayId, participants) {
    let allParticipants = {};
    if (fs.existsSync(PARTICIPANTS_FILE)) {
        try {
            const data = fs.readFileSync(PARTICIPANTS_FILE, 'utf8');
            allParticipants = JSON.parse(data);
        } catch (error) {
            console.error('Error reading participants file:', error);
            allParticipants = {};
        }
    }
    allParticipants[giveawayId] = participants;
    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(allParticipants, null, 2));
}

async function endGiveaway(giveawayId) {
    let giveaways = loadGiveaways();

    const giveaway = giveaways.find(g => g.id === giveawayId);

    if (!giveaway) return;

    const channel = await client.channels.fetch(giveaway.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) return;

    const participants = getParticipants(giveawayId);

    let winners = [];
    if (participants.length > 0) {
        for (let i = 0; i < giveaway.winners; i++) {
            const winnerId = participants[Math.floor(Math.random() * participants.length)];
            winners.push(`<@${winnerId}>`);
            participants.splice(participants.indexOf(winnerId), 1);
        }
    }

    const resultEmbed = new discord.EmbedBuilder()
        .setTitle('🎉 Giveaway Ended 🎉')
        .setDescription(winners.length > 0 ? `Winners: ${winners.join(', ')}\nPrize: **${giveaway.prize}**` : 'Aucun participant.')
        .setFooter({ text: `Giveaway ID: ${giveawayId}` });

    try {
        await channel.send({ embeds: [resultEmbed] });
    } catch (error) {
        console.error('Error sending giveaway result:', error);
    }

    giveaway.ended = true;  // Marquer le giveaway comme terminé
    fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2));

    // On ne supprime plus le giveaway, il reste dans les fichiers pour les rerolls
}

function saveReroll(rerollResult) {
    let rerolls = [];
    if (fs.existsSync(REROLLS_FILE)) {
        try {
            const data = fs.readFileSync(REROLLS_FILE, 'utf8');
            rerolls = JSON.parse(data);
        } catch (error) {
            console.error('Error reading rerolls file:', error);
            rerolls = [];
        }
    }
    rerolls.push(rerollResult);
    fs.writeFileSync(REROLLS_FILE, JSON.stringify(rerolls, null, 2));
}

function deleteRerollResult(rerollResult) {
    let rerolls = [];
    if (fs.existsSync(REROLLS_FILE)) {
        try {
            const data = fs.readFileSync(REROLLS_FILE, 'utf8');
            rerolls = JSON.parse(data);
        } catch (error) {
            console.error('Error reading rerolls file:', error);
            rerolls = [];
        }
    }
    rerolls = rerolls.filter(r => r.giveawayId !== rerollResult.giveawayId || r.winnerId !== rerollResult.winnerId);
    fs.writeFileSync(REROLLS_FILE, JSON.stringify(rerolls, null, 2));
}


// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);