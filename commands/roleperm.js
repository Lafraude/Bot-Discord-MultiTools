const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const discord = require("discord.js");
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


// Role perm 
const rolePermFile = './rolePerms.json';
let rolePerms = {};
if (fs.existsSync(rolePermFile)) {
    rolePerms = JSON.parse(fs.readFileSync(rolePermFile));
} else {
    fs.writeFileSync(rolePermFile, JSON.stringify(rolePerms, null, 4));
}

client.on('guildMemberAdd', async member => {
    const memberId = member.id;
    const guildId = member.guild.id;

    if (rolePerms[guildId] && rolePerms[guildId][memberId]) {
        const roleId = rolePerms[guildId][memberId];
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
            await member.roles.add(role);
            console.log(`Rôle ${role.name} réassigné à ${member.user.tag}.`);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'role-perm') {
      // 00000000000000000000000010000000  = LE BITFIEL DE MANAGE ROLE 
      if (!interaction.member.permissions.has('00000000000000000000000010000000')) {
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
  
      }

        const member = interaction.options.getMember('membre');
        const role = interaction.options.getRole('role');

        if (!rolePerms[interaction.guild.id]) {
            rolePerms[interaction.guild.id] = {};
        }

        rolePerms[interaction.guild.id][member.id] = role.id;

        fs.writeFileSync(rolePermFile, JSON.stringify(rolePerms, null, 4));

        await member.roles.add(role);
        await interaction.reply(`<@&${role.id}> a été attribué à <@${member.user.id}> de manière permanente.`);

    } else if (commandName === 'role-perm-remove') {

      if (!interaction.member.permissions.has('00000000000000000000000010000000')) {
        return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
  
      }

        const member = interaction.options.getMember('membre');

        if (rolePerms[interaction.guild.id] && rolePerms[interaction.guild.id][member.id]) {
            const roleId = rolePerms[interaction.guild.id][member.id];
            const role = interaction.guild.roles.cache.get(roleId);

            if (role) {
                await member.roles.remove(role);
                delete rolePerms[interaction.guild.id][member.id];
                fs.writeFileSync(rolePermFile, JSON.stringify(rolePerms, null, 4));
                await interaction.reply(`Le rôle <@&${role.id}> a été retiré de <@${member.user.id}>.`);
            } else {
                await interaction.reply(`Le rôle sauvegardé n'existe plus sur ce serveur.`);
            }
        } else {
            await interaction.reply(`<@${member.user.id}> n'a pas de rôle permanent enregistré.`);
        }
    }
});

// NE PAS MODIFIER
client.login(config.token)
  .catch(console.error);