const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST, channelMention, GuildAuditLogsEntry } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const { title } = require('process');

// Créer le client Discord
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

client.once('ready', async => {
    console.log(`Système de log start sans erreur mon bebou sucré au sucre salé \nMais attention il peux toujours avoir une erreur lors d'une action`);
})

// Fonction pour initialiser le fichier logChannels.json
function initializeLogFile() {
    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, JSON.stringify({}, null, 4), 'utf-8');
        console.log('logChannels.json a été initialisé.');
    }
}

// Initialisation du fichier JSON au démarrage
initializeLogFile();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setup-logs') {
        const categoryName = interaction.options.getString('category');
        const guild = interaction.guild;

        try {
            // Répond immédiatement avec un message éphémère de chargement
            await interaction.deferReply({ ephemeral: true });
            
            // Crée la catégorie
            const category = await guild.channels.create({
                name: categoryName,
                type: 4, // 4 est le type pour les catégories
                permissionOverwrites: [
                    {
                        id: guild.id, // ID du rôle @everyone (c'est toujours l'ID de la guilde)
                        deny: ['0x0000000000000400'], // Refuse la permission de voir les salons
                    }
                ]
            });

            // Crée les salons sous la catégorie
            const channelsToCreate = ['role', 'sanction', 'message', 'voice', 'délai', 'join', 'autre', 'canal'];

            let logChannels = {};
            for (let channelName of channelsToCreate) {
                const channel = await guild.channels.create({
                    name: channelName,
                    type: 0, // 0 est le type pour les salons textuels
                    parent: category.id
                });
                logChannels[channelName] = channel.id;
            }

            // Enregistrer dans logChannels.json
            const logFilePath = path.resolve(__dirname, 'logChannels.json');
            const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));

            data[guild.id] = {
                category: category.id,
                channels: logChannels
            };

            fs.writeFileSync(logFilePath, JSON.stringify(data, null, 4), 'utf-8');

            // Éditer le message initial une fois les salons créés
            await interaction.editReply({
                content: `Les salons de log ont été créés sous la catégorie \`${categoryName}\`.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: 'Une erreur est survenue lors de la création des salons.', 
                ephemeral: true
            });
        }
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Partie logs C EST PAS LA COMMANDE WOULA


   //////////////////////////////
  /////// PARTIE Message ///////
 //////////////////////////////

// Message del
client.on('messageDelete', async (message) => {

        if (message.author.bot) return;

    if (!message.guild || !message.channel) return;

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[message.guild.id]) {
        return; 
    }

    const logChannelId = data[message.guild.id].channels.message;
    if (!logChannelId) {
        return; 
    }

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        return; 
    }

    const embed = {
        color: 0xff00ff, 
        title: 'Message Supprimé',
        description: `**Auteur :** ${message.author ? `<@${message.author.id}>` : 'Auteur inconnu'}\n\n**Message :** \`\`\` ${message.content || 'Aucun contenu'}\`\`\` `,
        timestamp: new Date(),
        footer: {
            text: 'Message supprimé',
        },
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Embed envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

// Message modif 
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.guild || !newMessage.channel) return;

    if (oldMessage.author.bot) return;

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[newMessage.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${newMessage.guild.id}`);
        return; 
    }

    const logChannelId = data[newMessage.guild.id].channels.message;
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${newMessage.guild.id}`);
        return; 
    }

    const logChannel = newMessage.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return; 
    }

    const embed = {
        color: 0xff00ff, 
        title: 'Message Modifié',
        description: `**Auteur :**<@${newMessage.author.id}> \n\n**Ancien Message :** \`\`\`${oldMessage.content || 'Aucun contenu'}\`\`\`\n\n**Nouveau Message :** \`\`\`${newMessage.content || 'Aucun contenu'}\`\`\``,
        timestamp: new Date(),
        footer: {
            text: 'Message modifié',
        },
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Embed envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

   //////////////////////////////
  /////// PARTIE VOCAL /////////
 //////////////////////////////
 client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
        const guild = newState.guild;
        const member = newState.member;
        const logFilePath = path.resolve(__dirname, 'logChannels.json');
        let data;

        try {
            data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        } catch (error) {
            console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
            return;
        }

        if (!data[guild.id]) {
            console.log(`Aucun salon de log enregistré pour la guilde : ${guild.id}`);
            return; 
        }

        const logChannelId = data[guild.id].channels.voice; 
        if (!logChannelId) {
            console.log(`Aucun ID de salon de log pour la guilde : ${guild.id}`);
            return;
        }

        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            console.log(`Le salon de log n'existe pas : ${logChannelId}`);
            return;
        }

        const embed = {
            color: 0x00ff00,
            title: "Utilisateur a rejoint un salon vocal",
            description: `<@${member.id}> a rejoint le salon vocal **${newState.channel.name}**`,
            fields: [
                {
                    name: "ID du Salon",
                    value: "<#" + newState.channel.id + ">", 
                },
                {
                    name: "Utilisateur",
                    value: `<@${member.id}> (ID: ${member.id})`, 
                }
            ],
            timestamp: new Date(), 
        };

        try {
            await logChannel.send({ embeds: [embed] });
            console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
        }
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        const guild = oldState.guild;
        const member = oldState.member;
        const logFilePath = path.resolve(__dirname, 'logChannels.json');
        let data;

        try {
            data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        } catch (error) {
            console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
            return;
        }

        if (!data[guild.id]) {
            console.log(`Aucun salon de log enregistré pour la guilde : ${guild.id}`);
            return; 
        }

        const logChannelId = data[guild.id].channels.voice; 
        if (!logChannelId) {
            console.log(`Aucun ID de salon de log pour la guilde : ${guild.id}`);
            return;
        }

        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            console.log(`Le salon de log n'existe pas : ${logChannelId}`);
            return;
        }

        const embed = {
            color: 0xff0000, 
            title: "Utilisateur a quitté un salon vocal",
            description: `<@${member.id}> a quitté le salon vocal **${oldState.channel.name}**`,
            fields: [
                {
                    name: "ID du Salon",
                    value: "<#" + oldState.channel.id + ">", 
                },
                {
                    name: "Utilisateur",
                    value: `<@${member.id}> (ID: ${member.id})`,
                }
            ],
            timestamp: new Date(), 
        };

        try {
            await logChannel.send({ embeds: [embed] });
            console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
        }
    }
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.serverMute && newState.serverMute) {
        const guild = newState.guild;
        const member = newState.member;
        
        try {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 24,
            });

            const log = fetchedLogs.entries.first(); 
            if (!log) {
                console.log("Aucun log trouvé.");
                return;
            }

            const { executor, target, action } = log; 
            if (target.id === member.id && action === 24) {
                const embed = {
                    color: 0xffa500, 
                    title: "Utilisateur mute",
                    description: `<@${member.id}> a été mute par <@${executor.id}> dans le salon vocal **${newState.channel.name}**.`,
                    fields: [
                        {
                            name: "Salon",
                            value: "<#" + newState.channel.id + ">", 
                        },
                        {
                            name: "Utilisateur",
                            value: `<@${member.id}> (ID: ${member.id})`, 
                        },
                        {
                            name: "Par qui",
                            value: `<@${executor.id}> (ID: ${executor.id})`, 
                        }
                    ],
                    timestamp: new Date(),
                };

                const logFilePath = path.resolve(__dirname, 'logChannels.json');
                let data;

                try {
                    data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
                } catch (error) {
                    console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
                    return;
                }

                if (!data[guild.id]) {
                    console.log(`Aucun salon de log enregistré pour la guilde : ${guild.id}`);
                    return; 
                }

                const logChannelId = data[guild.id].channels.voice;
                if (!logChannelId) {
                    console.log(`Aucun ID de salon de log pour la guilde : ${guild.id}`);
                    return;
                }

                const logChannel = guild.channels.cache.get(logChannelId);
                if (!logChannel) {
                    console.log(`Le salon de log n'existe pas : ${logChannelId}`);
                    return;
                }

                try {
                    await logChannel.send({ embeds: [embed] });
                    console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
                } catch (error) {
                    console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
        }
    }
});

   //////////////////////////////
  /////// PARTIE SALON /////////
 //////////////////////////////

// Channel create 
client.on('channelCreate', async (channel) => {
    if (!channel) {
        console.error("L'objet channel est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[channel.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${channel.guild.id}`);
        return;
    }

    const logChannelId = data[channel.guild.id].channels.canal;
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${channel.guild.id}`);
        return; 
    } 

    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let creatorId = 'Inconnu'; 
    try {
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: 10, 
        });
        const channelLog = fetchedLogs.entries.first(); 

        if (channelLog) {
            const { executor } = channelLog; 
            creatorId = executor ? executor.id : 'Inconnu'; 
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0x00ff00, 
        title: "Nouveau Salon Créé",
        description: `Un nouveau salon a été créé : **<#${channel.id}>**`,
        fields: [
            {
                name: "Type de Salon",
                value: channel.type === 0 ? "Salon Textuel" : "Salon Vocal", 
                inline: true,
            },
            {
                name: "ID du Salon",
                value: channel.id,
                inline: true,
            },
            {
                name: "Créé par",
                value: `<@${creatorId}> (ID: ${creatorId})`, 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

// Channel delete 
client.on('channelDelete', async (channel) => {
    if (!channel) {
        console.error("L'objet channel est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[channel.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${channel.guild.id}`);
        return; 
    }

    const logChannelId = data[channel.guild.id].channels.canal; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${channel.guild.id}`);
        return; 
    } 

    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let deleterId = 'Inconnu'; 
    try {
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: 12, 
        });
        const deleteLog = fetchedLogs.entries.first(); 

        if (deleteLog) {
            const { executor } = deleteLog; 
            deleterId = executor ? executor.id : 'Inconnu'; 
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0xff0000, 
        title: "Salon Supprimé",
        description: `Un salon a été supprimé : ***@${channel.name}***`,
        fields: [
            {
                name: "Type de Salon",
                value: channel.type === 0 ? "Salon Textuel" : "Salon Vocal", 
                inline: true,
            },
            {
                name: "ID du Salon",
                value: channel.id,
                inline: true,
            },
            {
                name: "Supprimé par",
                value: `<@${deleterId}> (ID: ${deleterId})`, 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

// Message update 
client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (!oldChannel || !newChannel) {
        console.error("Les objets oldChannel ou newChannel sont undefined");
        return;
    }

    if (oldChannel.permissionOverwrites.cache.equals(newChannel.permissionOverwrites.cache)) {
        console.log("Les permissions ont été modifiées, pas d'envoi de message.");
        return; 
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[newChannel.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${newChannel.guild.id}`);
        return;
    }

    const logChannelId = data[newChannel.guild.id].channels.canal; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${newChannel.guild.id}`);
        return; 
    } 

    const logChannel = newChannel.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let editorId = 'Inconnu'; 
    try {
        const fetchedLogs = await newChannel.guild.fetchAuditLogs({
            limit: 1,
            type: 11,
        });
        const updateLog = fetchedLogs.entries.first(); 

        if (updateLog) {
            const { executor } = updateLog; 
            editorId = executor ? executor.id : 'Inconnu'; 
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0x00ff00, 
        title: "Salon Modifié",
        description: `Le salon **${oldChannel.name}** a été modifié`,
        fields: [
            {
                name: "Ancien Nom",
                value: oldChannel.name,
                inline: true
            },
            {
                name: "Nouveau Nom",
                value: newChannel.name,
                inline: true
            },
            {
                name: "Modifié par",
                value: `<@${editorId}> (ID: ${editorId})`, 
            }
        ],
        timestamp: new Date(),
    };

    if (oldChannel.name !== newChannel.name) {
        embed.fields.push({
            name: 'Changement',
            value: `Le nom du salon est passé de **${oldChannel.name}** à **${newChannel.name}**`,
        });
    }

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});



   //////////////////////////////
  /////// PARTIE SANCTION //////
 //////////////////////////////

 client.on('guildMemberRemove', async (member) => {
    if (!member) {
        console.error("L'objet member est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[member.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${member.guild.id}`);
        return; 
    }

    const logChannelId = data[member.guild.id].channels.sanction; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${member.guild.id}`);
        return; 
    } 

    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let executorId = 'Inconnu'; 
    let kickReason = 'Aucune raison spécifiée';
    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 20, 
        });
        const kickLog = fetchedLogs.entries.first(); 

        if (kickLog) {
            const { executor, target, reason } = kickLog; 
            if (target.id === member.id) { 
                executorId = executor ? executor.id : 'Inconnu';
                kickReason = reason || 'Aucune raison spécifiée';
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0xff0000, 
        title: "Membre Kické",
        description: `Un membre a été kické du serveur.`,
        fields: [
            {
                name: "Membre Kické",
                value: `<@${member.id}> (ID: ${member.id})`, 
            },
            {
                name: "Kické par",
                value: `<@${executorId}> (ID: ${executorId})`, 
            },
            {
                name: "Raison",
                value: kickReason, 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

client.on('guildBanAdd', async (ban) => {
    if (!ban || !ban.guild || !ban.user) {
        console.error("Les objets ban, guild ou user sont undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[ban.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${ban.guild.id}`);
        return; 
    }

    const logChannelId = data[ban.guild.id].channels.sanction; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${ban.guild.id}`);
        return;
    }

    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let executorId = 'Inconnu'; 
    let banReason = 'Aucune raison spécifiée';
    try {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 22, 
        });
        const banLog = fetchedLogs.entries.first(); 

        if (banLog) {
            const { executor, target, reason } = banLog; 
            if (target.id === ban.user.id) { 
                executorId = executor ? executor.id : 'Inconnu';
                banReason = reason || 'Aucune raison spécifiée';
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0xff0000, 
        title: "Membre Banni",
        description: `Un membre a été banni du serveur.`,
        fields: [
            {
                name: "Membre Banni",
                value: `<@${ban.user.id}> (ID: ${ban.user.id})`, 
                inline: true,
            },
            {
                name: "Banni par",
                value: `<@${executorId}> (ID: ${executorId})`, 
                inline: true,
            },
            {
                name: "Raison",
                value: banReason, 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

client.on('guildBanRemove', async (ban) => {
    if (!ban || !ban.guild || !ban.user) {
        console.error("Les objets ban, guild ou user sont undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[ban.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${ban.guild.id}`);
        return; 
    }

    const logChannelId = data[ban.guild.id].channels.sanction; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${ban.guild.id}`);
        return;
    }

    const logChannel = ban.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let executorId = 'Inconnu'; 
    try {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 23, 
        });
        const unbanLog = fetchedLogs.entries.first(); 

        if (unbanLog) {
            const { executor, target } = unbanLog; 
            if (target.id === ban.user.id) { 
                executorId = executor ? executor.id : 'Inconnu';
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0x00ff00, 
        title: "Membre Débanni",
        description: `Un membre a été débanni du serveur.`,
        fields: [
            {
                name: "Membre Débanni",
                value: `<@${ban.user.id}> (ID: ${ban.user.id})`, 
            },
            {
                name: "Débanni par",
                value: `<@${executorId}> (ID: ${executorId})`, 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
        const logFilePath = path.resolve(__dirname, 'logChannels.json');
        let data;

        try {
            data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        } catch (error) {
            console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
            return;
        }

        if (!data[newMember.guild.id]) {
            console.log(`Aucun salon de log enregistré pour la guilde : ${newMember.guild.id}`);
            return;
        }

        const logChannelId = data[newMember.guild.id].channels.sanction; 
        if (!logChannelId) {
            console.log(`Aucun ID de salon de log pour la guilde : ${newMember.guild.id}`);
            return;
        }

        const logChannel = newMember.guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            console.log(`Le salon de log n'existe pas : ${logChannelId}`);
            return;
        }

        
        let executorId = 'Inconnu'; 
        let reason = 'Aucune raison spécifiée'; 
        try {
            const fetchedLogs = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 24, 
            });
            const timeoutLog = fetchedLogs.entries.first(); 

            if (timeoutLog) {
                const { executor, target, changes, reason: auditReason } = timeoutLog; 
                const hasTimeoutChange = changes.some(change => change.key === 'communication_disabled_until');

                if (hasTimeoutChange && target.id === newMember.id) { 
                    executorId = executor ? executor.id : 'Inconnu';
                    reason = auditReason || 'Aucune raison spécifiée';
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
        }

        const timeoutUntil = newMember.communicationDisabledUntil ? 
            new Date(newMember.communicationDisabledUntil).toLocaleString() : 'Indéterminé'; 

        const embed = {
            color: 0xffa500, 
            title: "Membre Timeout",
            description: `Un membre a été Timeout.`,
            fields: [
                {
                    name: "Membre",
                    value: `<@${newMember.id}> (ID: ${newMember.id})`, 
                    inline: true,
                },
                {
                    name: "Timeout par",
                    value: `<@${executorId}> (ID: ${executorId})`, 
                    inline: true,
                },
                {
                    name: "Durée du Timeout",
                    value: timeoutUntil, 
                },
                {
                    name: "Raison",
                    value: reason, 
                }
            ],
            timestamp: new Date(), 
        };

        try {
            await logChannel.send({ embeds: [embed] });
            console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
        }
    }
});



   //////////////////////////////
  /////// PARTIE ROLE //////////
 //////////////////////////////

 client.on('roleCreate', async (role) => {
    if (!role) {
        console.error("L'objet role est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[role.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${role.guild.id}`);
        return; 
    }

    const logChannelId = data[role.guild.id].channels.role; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${role.guild.id}`);
        return;
    }

    const logChannel = role.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let executorId = 'Inconnu'; 
    try {
        const fetchedLogs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: 30, 
        });
        const roleCreateLog = fetchedLogs.entries.first(); 

        if (roleCreateLog) {
            const { executor, reason: auditReason } = roleCreateLog;
            executorId = executor ? executor.id : 'Inconnu';
            reason = auditReason || 'Aucune raison spécifiée';
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

  
    const embed = {
        color: 0x00ff00, 
        title: "Nouveau Rôle Créé",
        description: `Un nouveau rôle a été créé : ***${role.name}***`,
        fields: [
            {
                name: "Créé par",
                value: `<@${executorId}> (ID: ${executorId})`, 
            },
            {
                name: "ID du Rôle",
                value: "<@&" + role.id + ">", 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});


client.on('roleDelete', async (role) => {
    if (!role) {
        console.error("L'objet role est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[role.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${role.guild.id}`);
        return; 
    }

    const logChannelId = data[role.guild.id].channels.role; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${role.guild.id}`);
        return;
    }

    const logChannel = role.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    let executorId = 'Inconnu'; 
    try {
        const fetchedLogs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: 32, 
        });
        const roleDeleteLog = fetchedLogs.entries.first(); 

        if (roleDeleteLog) {
            const { executor, reason: auditReason } = roleDeleteLog;
            executorId = executor ? executor.id : 'Inconnu';
            reason = auditReason || 'Aucune raison spécifiée';
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    const embed = {
        color: 0xff0000, 
        title: "Rôle Supprimé",
        description: `Un rôle a été supprimé : **${role.name}**`,
        fields: [
            {
                name: "Supprimé par",
                value: `<@${executorId}> (ID: ${executorId})`, 
            },
            {
                name: "ID du Rôle",
                value: "***" + role.id + "***", 
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});

client.on('roleUpdate', async (oldRole, newRole) => {
    if (!oldRole || !newRole) {
        console.error("L'objet oldRole ou newRole est undefined");
        return;
    }

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[newRole.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${newRole.guild.id}`);
        return; 
    }

    const logChannelId = data[newRole.guild.id].channels.join; 
    if (!logChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${newRole.guild.id}`);
        return;
    }

    const logChannel = newRole.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`Le salon de log n'existe pas : ${logChannelId}`);
        return;
    }

    const oldPermissions = oldRole.permissions;
    const newPermissions = newRole.permissions;

    const addedPermissions = newPermissions.toArray().filter(perm => !oldPermissions.has(perm));
    const removedPermissions = oldPermissions.toArray().filter(perm => !newPermissions.has(perm));

    const roleNameChanged = oldRole.name !== newRole.name;

    let executorId = 'Inconnu'; 
    try {
        const fetchedLogs = await newRole.guild.fetchAuditLogs({
            limit: 1,
            type: 31, 
        });
        const roleUpdateLog = fetchedLogs.entries.first(); 

        if (roleUpdateLog) {
            const { executor, reason: auditReason } = roleUpdateLog;
            executorId = executor ? executor.id : 'Inconnu';
            reason = auditReason || 'Aucune raison spécifiée';
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des logs d'audit : ${error.message}`);
    }

    let permChanges = '';
    if (addedPermissions.length > 0) {
        permChanges += `**Permissions ajoutées** : ${addedPermissions.join(', ')}\n`;
    }
    if (removedPermissions.length > 0) {
        permChanges += `**Permissions supprimées** : ${removedPermissions.join(', ')}`;
    }

    let nameChange = '';
    if (roleNameChanged) {
        nameChange = `**Nom du rôle modifié** : De \`${oldRole.name}\` à \`${newRole.name}\`\n`;
    }

    const embed = {
        color: 0xffa500, 
        title: "Rôle Modifié",
        description: `Le rôle **${oldRole.name}** a été modifié.`,
        fields: [
            {
                name: "Modifié par",
                value: `<@${executorId}> (ID: ${executorId})`, 
                inline: true,
            },
            {
                name: "ID du Rôle",
                value: "<@&" + newRole.id + ">", 
                inline: true,
            },
            {
                name: "Changements de nom",
                value: nameChange || 'Aucun changement de nom', 
            },
            {
                name: "Modifications des permissions",
                value: permChanges || 'Aucune permission modifiée', 
                inline: true,
            }
        ],
        timestamp: new Date(),
    };

    try {
        await logChannel.send({ embeds: [embed] });
        console.log(`Message envoyé dans le salon de log : ${logChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de log : ${error.message}`);
    }
});



   //////////////////////////////
  /////// PARTIE AUTRE /////////
 //////////////////////////////

 client.on('guildUpdate', async (oldGuild, newGuild) => {
    if (oldGuild.name !== newGuild.name) {
        console.log(`Nom du serveur modifié : ${oldGuild.name} -> ${newGuild.name}`);

        const logFilePath = path.resolve(__dirname, 'logChannels.json');
        let data;

        try {
            data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        } catch (error) {
            console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
            return;
        }

        if (!data[oldGuild.id]) {
            console.log(`Aucun salon de log enregistré pour la guilde : ${oldGuild.id}`);
            return;
        }

        const autreChannelId = data[oldGuild.id].channels.autre;
        if (!autreChannelId) {
            console.log(`Aucun ID de salon de log pour la guilde : ${oldGuild.id}`);
            return; 
        }

        const autreChannel = oldGuild.channels.cache.get(autreChannelId);
        if (!autreChannel) {
            console.log(`Le salon de log n'existe pas : ${autreChannelId}`);
            return; 
        }

        const embed = {
            color: 0xff00ff, 
            title: 'Changement de Nom de Serveur',
            description: `**Ancien Nom :** ${oldGuild.name}\n**Nouveau Nom :** ${newGuild.name}\n**Modifié par :** <@${newGuild.ownerId}>`, 
            timestamp: new Date(),
            footer: {
                text: 'Modification du serveur',
            },
        };

        try {
            await autreChannel.send({ embeds: [embed] });
            console.log(`Embed envoyé dans le salon autre : ${autreChannel.name}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi de l'embed dans le salon autre : ${error.message}`);
        }
    }
});

   //////////////////////////////
  /////// PARTIE JOIN //////////
 //////////////////////////////

 client.on('guildMemberAdd', async (member) => {

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[member.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${member.guild.id}`);
        return; 
    }

    const joinChannelId = data[member.guild.id].channels.join;
    if (!joinChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${member.guild.id}`);
        return; 
    }

    const joinChannel = member.guild.channels.cache.get(joinChannelId);
    if (!joinChannel) {
        console.log(`Le salon de log n'existe pas : ${joinChannelId}`);
        return; 
    }

    const embed = {
        color: 0xff00ff, 
        title: 'Nouveau Membre Rejoint',
        description: `**Membre :**<@${member.id}> \n**Date de création du compte :** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
        thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true }), 
        },
        timestamp: new Date(),
        footer: {
            text: 'Bienvenue dans le serveur!',
        },
    };

    try {
        await joinChannel.send({ embeds: [embed] });
        console.log(`Embed envoyé dans le salon de join : ${joinChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de join : ${error.message}`);
    }
});

client.on('guildMemberRemove', async (member) => {

    const logFilePath = path.resolve(__dirname, 'logChannels.json');
    let data;

    try {
        data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier logChannels.json : ${error.message}`);
        return;
    }

    if (!data[member.guild.id]) {
        console.log(`Aucun salon de log enregistré pour la guilde : ${member.guild.id}`);
        return; 
    }

    // Récupérer l'ID du salon pour les joins
    const joinChannelId = data[member.guild.id].channels.join;
    if (!joinChannelId) {
        console.log(`Aucun ID de salon de log pour la guilde : ${member.guild.id}`);
        return; 
    }

    // Récupérer le salon de log
    const joinChannel = member.guild.channels.cache.get(joinChannelId);
    if (!joinChannel) {
        console.log(`Le salon de log n'existe pas : ${joinChannelId}`);
        return; 
    }

    const embed = {
        color: 0xff00ff, 
        title: 'Membre Quitte',
        description: `**Membre :**<@${member.id}> \n**Date de départ :** ${new Date().toLocaleString()}`,
        thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true }), 
        },
        timestamp: new Date(),
        footer: {
            text: 'Merci d\'avoir été parmi nous!',
        },
    };

    try {
        await joinChannel.send({ embeds: [embed] });
        console.log(`Embed envoyé dans le salon de join : ${joinChannel.name}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed dans le salon de join : ${error.message}`);
    }
});



client.login(config.token);
