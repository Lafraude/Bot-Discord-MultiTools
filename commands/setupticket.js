const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
const path = require('path');
const config = require("../config");
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
let ticketConfig = {};
let userTickets = {};

if (fs.existsSync('ticketConfig.json')) {
    ticketConfig = JSON.parse(fs.readFileSync('ticketConfig.json', 'utf8'));
}

if (fs.existsSync('userTickets.json')) {
    userTickets = JSON.parse(fs.readFileSync('userTickets.json', 'utf8'));
}

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand() && interaction.commandName === 'setup-ticket') {
        const ticketChannel = interaction.options.getChannel('channel');
        const staffRole = interaction.options.getRole('staff');

        const modal = new discord.ModalBuilder()
            .setCustomId('setup_ticket_modal')
            .setTitle('Configurer le système de tickets');

        const titleInput = new discord.TextInputBuilder()
            .setCustomId('ticket_title')
            .setLabel('Titre de l\'embed')
            .setStyle(1);

        const descriptionInput = new discord.TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Description de l\'embed')
            .setStyle(2);

        const buttonInput = new discord.TextInputBuilder()
            .setCustomId('ticket_button')
            .setLabel('Texte du bouton')
            .setStyle(1);

        modal.addComponents(
            new discord.ActionRowBuilder().addComponents(titleInput),
            new discord.ActionRowBuilder().addComponents(descriptionInput),
            new discord.ActionRowBuilder().addComponents(buttonInput),
        );

        await interaction.showModal(modal);

        client.once('interactionCreate', async modalInteraction => {
            if (modalInteraction.isModalSubmit() && modalInteraction.customId === 'setup_ticket_modal') {
                const title = modalInteraction.fields.getTextInputValue('ticket_title');
                const description = modalInteraction.fields.getTextInputValue('ticket_description');
                const buttonText = modalInteraction.fields.getTextInputValue('ticket_button');

                ticketConfig = {
                    ticketChannelId: ticketChannel.id,
                    staffRoleId: staffRole.id,
                    embedTitle: title,
                    embedDescription: description,
                    buttonText: buttonText
                };

                fs.writeFileSync('ticketConfig.json', JSON.stringify(ticketConfig, null, 4), 'utf8');

                const ticketEmbed = new discord.EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor('Blue');

                const button = new discord.ActionRowBuilder()
                    .addComponents(
                        new discord.ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel(buttonText)
                            .setStyle(2),
                    );

                await ticketChannel.send({ embeds: [ticketEmbed], components: [button] });
                await modalInteraction.reply({ content: 'Système de tickets configuré avec succès!', ephemeral: true });
            }
        });
    }

    if (interaction.isButton() && interaction.customId === 'create_ticket') {
        console.log("Le bouton 'Créer un ticket' a été cliqué.");
        const guild = interaction.guild;
        const member = interaction.member;

        if (userTickets[member.id] && userTickets[member.id].status === 'open') {
            return await interaction.reply({ content: 'Vous avez déjà un ticket ouvert. Veuillez fermer le ticket existant avant d\'en créer un nouveau.', ephemeral: true });
        }

        const ticketChannel = await guild.channels.create({
            name: `ticket-${member.user.username}`,
            type: 0, // 0 = Guild Text Channel
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ['0x0000000000000400'],
                },
                {
                    id: member.id,
                    allow: ['0x0000000000000400', '0x0000000000000800'],
                },
                {
                    id: ticketConfig.staffRoleId,
                    allow: ['0x0000000000000400', '0x0000000000000800'],
                },
            ],
        });

        const closeEmbed = new discord.EmbedBuilder()
            .setTitle('Ticket créé')
            .setDescription('Un membre du staff va bientôt vous répondre. Cliquez sur le bouton pour fermer le ticket.');

        const closeButton = new discord.ActionRowBuilder()
            .addComponents(
                new discord.ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Fermer le ticket')
                    .setStyle(4),
            );

        await ticketChannel.send({ embeds: [closeEmbed], components: [closeButton] });

        userTickets[member.id] = { channelId: ticketChannel.id, status: 'open' };

        fs.writeFileSync('userTickets.json', JSON.stringify(userTickets, null, 4), 'utf8');

        await interaction.reply({ content: `Votre ticket a été créé: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        console.log("Le bouton 'Fermer le ticket' a été cliqué.");
        const ticketChannel = interaction.channel;
        const member = interaction.member;

        if (!userTickets[member.id] || userTickets[member.id].channelId !== ticketChannel.id) {
            return await interaction.reply({ content: 'Impossible de trouver le ticket associé à votre demande de fermeture.', ephemeral: true });
        }

        const modal = new discord.ModalBuilder()
            .setCustomId('close_ticket_modal')
            .setTitle('Fermer le ticket');

        const reasonInput = new discord.TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('Raison de la fermeture')
            .setStyle(2);

        modal.addComponents(new discord.ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);

        client.once('interactionCreate', async modalInteraction => {
            if (modalInteraction.isModalSubmit() && modalInteraction.customId === 'close_ticket_modal') {
                const reason = modalInteraction.fields.getTextInputValue('close_reason');

                try {
                    await member.send(`Votre ticket a été fermé pour la raison suivante : ${reason}`);
                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message privé :', error);
                }

                userTickets[member.id].status = 'closed';

                fs.writeFileSync('userTickets.json', JSON.stringify(userTickets, null, 4), 'utf8');

                await modalInteraction.reply({ content: 'Le ticket sera fermé dans 5 secondes...', ephemeral: true });
                setTimeout(() => ticketChannel.delete(), 5000);
            }
        });
    }
});

client.login(config.token)
  .catch("Erreur sur le token" + console.error);
