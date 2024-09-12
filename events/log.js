const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
const path = require('path');
const config = require("./config");
const log = require("./log.json")
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

// Message supp
client.on('messageDelete', async message => {
    if(message.author.bot) return;  
  
    client.channels.cache.get(log.messageLogChannelId).send({ embeds : [{
      
      title: ':pencil2: Message supprimé',
      description: 'Un message a été supprimé dans le salon <#' + message.channel.id + '>',
      fields: [
      {
        name: 'Auteur du message',
        value: '<@' + message.author.id + '>',
        inline: true,
      },
      {
        name: 'Message supprimé',
        value: '```' + message.content + '```', 
        inline: true,
      }
      ]
    }]})
  })
  
  
  // message edit
  
  
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if(oldMessage.author.bot) return;  
  
    client.channels.cache.get(log.messageLogChannelId).send({ embeds : [{
      
      title: ':pencil2: Message modifié',
      description: 'Un message a été modifié dans le salon <#' + oldMessage.channel.id + '>',
      fields: [
      {
        name: 'Auteur du message',
        value: '<@' + oldMessage.author.id + '>',
        inline: true,
      },
      {
        name: 'Message avant modification',
        value: '```' + oldMessage.content + '```'
      },
      {
        name: 'Message après modification',
        value: '```' + newMessage.content + '```'
      }
    ],
    }]}
  )})
  
  ///////////////////////
  // CT ROLE //
  
  //role create 
  client.on('roleCreate', async (role) => {
    try {
        const auditLogs = await role.guild.fetchAuditLogs({
            type: 30,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        const embed = new discord.Embed({
          title: ':tada: Nouveau rôle créé',
          description: `Le rôle **<@&${role.id}>** a été créé.`,
          fields: [
              { name: 'Rôle', value: '<@&' + role.id + '>', inline: true },
              { name: 'Créé par', value: '<@' + user.id + '>', inline: true }
          ],
          timestamp: new Date(),
        })
  
        const channel = client.channels.cache.get(log.roleLogsChannelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  //role delete 
  
  client.on('roleDelete', async (role) => {
    try {
        const auditLogs = await role.guild.fetchAuditLogs({
            type: 32,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Rôle supprimé')
            .setDescription(`Le rôle **\` ${role.name} \`** a été supprimé.`)
            .addFields(
                { name: 'Rôle', value: '`' + role.name + '`', inline: true },
                { name: 'Supprimé par', value: '<@' + user.id + '>', inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();
  
        const channel = client.channels.cache.get(log.roleLogsChannelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  // Role donner 
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({
                type: 25,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const user = logEntry.executor;
            const role = addedRoles.first(); 
  
            const embed = new discord.EmbedBuilder()
                .setTitle('Rôle ajouté à un membre')
                .setDescription(`Le rôle **\`${role.name}\`** a été ajouté à **${newMember.user.tag}**.`)
                .addFields(
                    { name: 'Utilisateur', value: '<@' + newMember.user.id + '>', inline: false },
                    { name: 'Rôle ajouté', value: '<@&' + role.id + '>', inline: true },
                    { name: 'Ajouté par', value: '<@' + user + '>', inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();
  
            const logChannel = client.channels.cache.get(log.roleLogsChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  // Role retiré 
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({
                type: 25,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const user = logEntry.executor;
            const role = removedRoles.first(); 
  
            const embed = new discord.EmbedBuilder()
                .setTitle('Rôle retiré à un membre')
                .setDescription(`Le rôle **\`${role.name}\`** a été retiré de **${newMember.user.tag}**.`)
                .addFields(
                    { name: 'Utilisateur', value: '<@' + newMember.user.id + '>', inline: false },
                    { name: 'Rôle retiré', value: '<@&' + role.id + '>', inline: true },
                    { name: 'Retiré par', value: '<@' + user + '>', inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();
  
            const logChannel = client.channels.cache.get(log.roleLogsChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  
  
  //permissions modifier 
  client.on('roleUpdate', async (oldRole, newRole) => {
    try {
        const auditLogs = await newRole.guild.fetchAuditLogs({
            type: 31,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        let changes = logEntry.changes.map(change => {
            if (change.key === 'permissions') {
                const oldPermissions = new discord.PermissionsBitField(BigInt(change.old));
                const newPermissions = new discord.PermissionsBitField(BigInt(change.new));
  
                const addedPermissions = newPermissions.toArray().filter(perm => !oldPermissions.has(perm));
                const removedPermissions = oldPermissions.toArray().filter(perm => !newPermissions.has(perm));
  
                let permChanges = '';
                if (addedPermissions.length > 0) {
                    permChanges += `**Ajoutées**:\n:white_check_mark: ${addedPermissions.join('\n:white_check_mark: ')}`;
                }
                if (removedPermissions.length > 0) {
                    permChanges += `**\n\nSupprimées**:\n:x: ${removedPermissions.join('\n:x: ')}\n`;
                }
                return `\n${permChanges}`;
            } else {
                return `${change.key}: \`${change.old}\` → \`${change.new}\``;
            }
        }).join('\n');
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Permissions modifié')
            .setDescription(`Le rôle **\`${oldRole.name}\`** a été modifié.`)
            .addFields(
                { name: 'Rôle', value: '<@&' + newRole.id + '>', inline: true },
                { name: 'Modifié par', value: '<@' + user.id + '>', inline: true },
                { name: 'Changements', value: changes || 'Aucun changement détecté' }
            )
            .setColor(newRole.color || 0x00AE86)
            .setTimestamp();
  
        const channel = client.channels.cache.get(log.roleLogsChannelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  ///////////////////////
  // CT SALON VOC //
  
  // Quand un membre join la voc 
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
        const member = newState.member;
        const channel = newState.channel;
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Membre a rejoint un canal vocal')
            .setDescription(`Le membre **\`${member.user.tag}\`** a rejoint le canal vocal **<#${channel.id}>**.`)
            .addFields(
                { name: 'Utilisateur', value: '<@' + member.user.id + '>', inline: true },
                { name: 'Canal vocal', value: '<#' + channel.id + '>', inline: false }
            )
            .setColor(0x00FF00)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.voiceLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    }
  });
  
  // Quand un membbre quitte la voc 
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        const member = oldState.member;
        const channel = oldState.channel;
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Membre a quitté un canal vocal')
            .setDescription(`Le membre **\`${member.user.tag}\`** a quitté le canal vocal **<#${channel.id}>**.`)
            .addFields(
                { name: 'Utilisateur', value: '<@' + member.user.id + '>', inline: true },
                { name: 'Canal vocal', value: '<#' + channel.id + '>', inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.voiceLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    }
  });
  
  // Quand un membre a était kick de la voc 
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        try {
            const auditLogs = await oldState.guild.fetchAuditLogs({
                type: 27,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const executor = logEntry.executor;
  
            const embed = new discord.EmbedBuilder()
                .setTitle('Membre déconnecté d\'un canal vocal')
                .setDescription(`Le membre **\`${oldState.member.user.tag}\`** a été déconnecté du canal vocal **<#${oldState.channel.id}>**.`)
                .addFields(
                    { name: 'Utilisateur', value: '<@' + oldState.member.user.id + ">", inline: true },
                    { name: 'Canal vocal', value: '<#' + oldState.channel.id + '>', inline: true },
                    { name: 'Déconnecté par', value: '<@' + executor.id + '>', inline: true }
                )
                .setColor(0xFF0000)
                .setTimestamp();
  
            const logChannel = client.channels.cache.get(log.voiceLogChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  // Quand un membre a été déplacé de voc
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        try {
            const auditLogs = await oldState.guild.fetchAuditLogs({
                type: 26,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const executor = logEntry.executor;
  
            const embed = new discord.EmbedBuilder()
                .setTitle('Membre déplacé de canal vocal')
                .setDescription(`Le membre **${oldState.member.user.tag}** a été déplacé de **${oldState.channel.name}** à **${newState.channel.name}**.`)
                .addFields(
                    { name: 'Utilisateur', value: '<@' + oldState.member.user.id + '>', inline: true },
                    { name: 'Déplacé par', value: '<@' + executor.id + '>', inline: true },
                    { name: 'Canal', value: '<#' + oldState.channel.id + '>' + ' ➡️ ' + '<#' + newState.channel.id + '>' , inline: false }              
                  )
                .setColor(0xFFA500)
                .setTimestamp();
  
            const logChannel = client.channels.cache.get(log.voiceLogChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  // Quand un membre a été mute dans la voc
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.serverMute && newState.serverMute) {
        try {
            const auditLogs = await newState.guild.fetchAuditLogs({
                type: 24,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const executor = logEntry.executor;
            const target = logEntry.target;
  
            if (target.id === newState.member.id) {
                const embed = new discord.EmbedBuilder()
                    .setTitle('Membre mute en vocal')
                    .setDescription(`Le membre **\`${newState.member.user.tag}\`** a été mute en vocal.`)
                    .addFields(
                        { name: 'Utilisateur', value: '<@' + newState.member.user.id + '>', inline: true },
                        { name: 'Muté par', value: '<@' + executor.id + '>', inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();
  
                const logChannel = client.channels.cache.get(log.voiceLogChannelId);
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  // Quand un membre a était mis en sourdine dans la voc 
  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.serverDeaf && newState.serverDeaf) {
        try {
            const auditLogs = await newState.guild.fetchAuditLogs({
                type: 24,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const executor = logEntry.executor;
            const target = logEntry.target;
  
            if (target.id === newState.member.id) {
                const embed = new discord.EmbedBuilder()
                    .setTitle('Membre mis en sourdine en vocal')
                    .setDescription(`Le membre **\`${newState.member.user.tag}\`** a été mis en sourdine en vocal.`)
                    .addFields(
                        { name: 'Utilisateur', value: '<@' + newState.member.user.id + '>', inline: true },
                        { name: 'Mis en sourdine par', value: '<@' + executor.id + '>', inline: true }
                    )
                    .setColor(0xFF0000)
                    .setTimestamp();
  
                const logChannel = client.channels.cache.get(log.voiceLogChannelId);
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  
  ///////////////////////
  // CT SALON // 
  
  // salon create 
  
  client.on('channelCreate', async (channel) => {
    try {
        if (!channel.guild) return; 
  
        const auditLogs = await channel.guild.fetchAuditLogs({
            type: 10,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        const embed = new discord.EmbedBuilder()
            .setTitle(':tada: Nouveau salon créé')
            .setDescription(`Le salon **\`${channel.name}\`** a été créé.`)
            .addFields(
                { name: 'Salon', value: '<#' + channel.id + '>', inline: false},
                { name: 'Type', value: '' + channel.type, inline: true },
                { name: 'Créé par', value: '<@' + user.id + '>', inline: true }
            )
  
        const logChannel = client.channels.cache.get(log.canalLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  // salon delete 
  client.on('channelDelete', async (channel) => {
    try {
        if (!channel.guild) return; 
  
        const auditLogs = await channel.guild.fetchAuditLogs({
            type: 12,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Salon supprimé')
            .setDescription(`Le salon **\`${channel.name}\`** a été supprimé.`)
            .addFields(
                { name: 'Salon', value: '\`' + channel.name + '\`', inline: false },
                { name: 'Type', value: '' + channel.type, inline: true },
                { name: 'Supprimé par', value: '<@' + user.id + '>', inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.canalLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  
  ///////////////////////
  // CT SANCTION // 
  
  // ban 
  client.on('guildBanAdd', async (ban) => {
    try {
        const auditLogs = await ban.guild.fetchAuditLogs({
            type: 22,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
        const reason = logEntry.reason || 'Aucune raison spécifiée';
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Utilisateur banni')
            .setDescription(`L'utilisateur **\'${ban.user.tag}\'** a été banni.`)
            .addFields(
                { name: 'Utilisateur', value: '<@' + ban.user.id + '>', inline: true },
                { name: 'Banni par', value: "<@" + user.id + ">", inline: true },
                { name: 'Raison', value: '```' + reason + '```' }
            )
            .setColor(0xFF0000)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.sanctionLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  // unban
  client.on('guildBanRemove', async (ban) => {
    try {
        const auditLogs = await ban.guild.fetchAuditLogs({
            type: 23,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
        const user = logEntry.executor;
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Utilisateur débanni')
            .setDescription(`L'utilisateur **\'${ban.user.tag}\'** a été débanni.`)
            .addFields(
                { name: 'Utilisateur', value: '<@' + ban.user.id + '>', inline: true },
                { name: 'Débanni par', value: '<@' + user.id + '>', inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.sanctionLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  
  // kick 
  client.on('guildMemberRemove', async (member) => {
    try {
        const auditLogs = await member.guild.fetchAuditLogs({
            type: 	20,
            limit: 1
        });
  
        const logEntry = auditLogs.entries.first();
  
        if (!logEntry || logEntry.target.id !== member.id) return;
  
        const user = logEntry.executor;
        const reason = logEntry.reason || 'Aucune raison spécifiée';
  
        const embed = new discord.EmbedBuilder()
            .setTitle('Membre expulsé')
            .setDescription(`Le membre **\'${member.user.tag}\'** a été expulsé.`)
            .addFields(
                { name: 'Utilisateur', value: '<@' + member.user.id + '>', inline: true },
                { name: 'Expulsé par', value: '<@' + user.id + '>', inline: true },
                { name: 'Raison', value: '```' + reason + '```' }
            )
            .setColor(0xFF0000)
            .setTimestamp();
  
        const logChannel = client.channels.cache.get(log.sanctionLogChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
    }
  });
  
  
  // TimeOut 
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({
                type: 24,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            const user = logEntry.executor;
            const reason = logEntry.reason || 'Aucune raison spécifiée';
  
            if (newMember.communicationDisabledUntilTimestamp) {
                const timeoutUntil = new Date(newMember.communicationDisabledUntilTimestamp).toLocaleString();
  
                const embed = new discord.EmbedBuilder()
                    .setTitle('Membre en Timeout')
                    .setDescription(`Le membre **\`${newMember.user.tag}\`** a été mis en timeout.`)
                    .addFields(
                        { name: 'Utilisateur', value: '<@' + newMember.user.id + '>', inline: true },
                        { name: 'Timeout par', value: '<@' + user.id + '>', inline: true },
                        { name: 'Raison', value: '```' + reason + '```' },
                        { name: 'Timeout jusqu\'à', value: timeoutUntil }
                    )
                    .setColor(0xFFA500)
                    .setTimestamp();
  
                const logChannel = client.channels.cache.get(log.délaiLogChannelId);
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  // Untimeout 
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp) {
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({
                type: 24,
                limit: 1
            });
  
            const logEntry = auditLogs.entries.first();
            if (!logEntry || logEntry.changes[0].key !== 'communication_disabled_until') return;
  
            const user = logEntry.executor;
  
            const embed = new discord.EmbedBuilder()
                .setTitle('Timeout retiré')
                .setDescription(`Le timeout du membre **\`${newMember.user.tag}\`** a été retiré.`)
                .addFields(
                    { name: 'Utilisateur', value: '<@' + newMember.user.id + '>', inline: true },
                    { name: 'Retiré par',  value: '<@' + user.id + '>', inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();
  
            const logChannel = client.channels.cache.get(log.délaiLogChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        }
    }
  });
  
  
  ///////////////////////
  // CT AUTRE // 
  
  // Join member 
  
  client.on('guildMemberAdd', member => {
    client.channels.cache.get(log.joinLogChannelId).send({ embeds : [{
      
      title: ':tada: Nouveau membre',
      description: 'Un nouveau membre a rejoint le serveur',
      fields: [
      {
        name: 'Membre',
        value: '<@' + member.id + '>',
      },
      {
        name: 'Age du compte',
        value: '' + member.user.createdAt.toLocaleString(),
      }
    ],
    thumbnail: { url: member.user.avatarURL() },
    }]})
  }
  );
  
  // Leave member 
  client.on('guildMemberRemove', member => {
    client.channels.cache.get(log.joinLogChannelId).send({ embeds : [{
      
      title: ':skull_crossbones: Un membre a quitté le serveur',
      description: '',
      color: 0xFF0000,
      fields: [
      {
        name: 'Membre',
        value: '<@' + member.id + '>',
      },
    ],
    thumbnail: { url: member.user.avatarURL() },
    }]})
  });

client.login(config.token)
    .catch(console.error);
