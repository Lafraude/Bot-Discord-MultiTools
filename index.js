const discord = require("discord.js");
const config = require("./config.json");
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { userInfo } = require("os");
const { error } = require("console");
const { v4: uuidv4 } = require('uuid');
const modals = require('discord-modals');
const { title, permission } = require("process");
const path = require('path');
const axios = require('axios'); 
const chalk = require('chalk');
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

// Commmande help 
const help = new discord.SlashCommandBuilder()
  .setName('help')
  .setDescription('Affiche les commandes disponibles pour le bot.')

// Commande setup antiraid 
const setupantiraid = new discord.SlashCommandBuilder()
    .setName('setup-antiraid')
    .setDescription('Configurer le bot pour protéger votre serveur contre les attaques de type raid.')

// Commande setup welcome
const setupwelcome = new discord.SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Configurer le bot pour gérer les bienvenus.')
    .addChannelOption(channel =>
      channel.setName('channel')
      .setDescription('Le channel pour envoyer le message')
      .setRequired(true)
    )
    .addRoleOption(role =>
      role.setName('role')
      .setDescription('Le rôle à attribuer à tous les nouveaux membres.')
      .setRequired(true)
    )

// Message reac qui donne un rôle 
const messagereac = new discord.SlashCommandBuilder()
    .setName('message-react')
    .setDescription('Ajoute un rôle à tous les nouveaux membres.')
    .addRoleOption(role =>
      role.setName('role')
      .setDescription('Le rôle à attribuer à tous les nouveaux membres.')
      .setRequired(false)
    )

// Commande setup log 

const setuplog = new discord.SlashCommandBuilder()
    .setName('setup-log')
    .setDescription('Configurer le bot pour suivre les logs.')

// Commande de ban 
const ban_commmande = new discord.SlashCommandBuilder()
  ban_commmande.setName('ban')
  ban_commmande.setDescription('Bannir un utilisateur')
  ban_commmande.addUserOption(user =>
    user.setName('target')
    .setDescription('L\'utilisateur à bannir')
    .setRequired(true)
  )
  ban_commmande.addStringOption(option =>
    option.setName('raison')
    .setDescription('Raison du ban')
    .setRequired(true)
  )
// Unban 
const unban_commmande = new discord.SlashCommandBuilder()
  unban_commmande.setName('unban')
  unban_commmande.setDescription('Débannir un utilisateur')
  unban_commmande.addUserOption(user =>
    user.setName('user_id')
    .setDescription('L\'utilisateur à débannir')
    .setRequired(true)
  )

// Commande de kick 
const kick_commande = new discord.SlashCommandBuilder()
  kick_commande.setName('kick')
  kick_commande.setDescription('Expluser un utilisateur à partir de son ID')
  kick_commande.addUserOption(user => 
    user.setName('target')
    .setDescription('L\'utilisateur à exclure')
    .setRequired(true)
)
// Commande de lock et unlock
const lock_commmande = new discord.SlashCommandBuilder()
  lock_commmande.setName('lock')
  lock_commmande.setDescription('Lock le salon')
  lock_commmande.addChannelOption(channel =>
    channel.setName('channel_id')
    .setDescription('Le salon à locker')
    .setRequired(true)
  )
  lock_commmande.addStringOption(option =>
    option.setName('raison')
    .setDescription('Raison du lock')
    .setRequired(true)
  )
// Unlock commande
const unlock_commmande = new discord.SlashCommandBuilder()
  unlock_commmande.setName('unlock')
  unlock_commmande.setDescription('Unlock le salon')
  unlock_commmande.addChannelOption(channel =>
    channel.setName('channel_id')
    .setDescription('Le salon à unlocker')
    .setRequired(true)
  )   

// Commande Giveaway
const giveaway = new discord.SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Créer un giveaway')
  .addIntegerOption(integer => 
    integer.setName('duration')
    .setDescription('Temps pour le giveaway.')
    .setRequired(true)
  )
  .addStringOption(option => 
    option.setName('prize')
    .setDescription('Prize')
    .setRequired(true)
  )
  .addIntegerOption(integer => 
    integer.setName('winners')
    .setDescription('Nombre de gagnants')
    .setRequired(true)
  )

// Commande Blacklist
const blacklistt = new discord.SlashCommandBuilder()
  .setName('blacklist')
  .setDescription('Ajouter un utilisateur à la blacklist')
  .addUserOption(user => 
    user.setName('user')
    .setDescription('L\'utilisateur à ajouter à la blacklist')
    .setRequired(true)
  )

// Commande unblacklist 

const unblacklistt = new discord.SlashCommandBuilder()
  .setName('unblacklist')
  .setDescription('Retirer un utilisateur de la blacklist')
  .addUserOption(user => 
    user.setName('user')
    .setDescription('L\'utilisateur à retirer de la blacklist')
    .setRequired(true)
  )

// WARN 

const warn_add = new discord.SlashCommandBuilder()
  .setName('warn-add')
  .setDescription('Ajouter un avertissement à un utilisateur')
  .addUserOption(user =>
    user.setName('user')
    .setDescription('L\'utilisateur à qui ajouter un avertissement')
    .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
    .setDescription('Raison du avertissement')
    .setRequired(true)
  )
// Warn REMOVE

const warn_remove = new discord.SlashCommandBuilder()
  .setName('warn-remove')
  .setDescription('Retirer un avertissement à un utilisateur')
  .addStringOption(option => 
    option.setName('warn_id')
    .setDescription('ID de l\'avertissement à retirer')
    .setRequired(true)
  )

// WARN list 

const warn_list = new discord.SlashCommandBuilder()
  .setName('warn-list')
  .setDescription('Liste les avertissements d\'un utilisateur')
  .addUserOption(user =>
    user.setName('user')
    .setDescription('L\'utilisateur pour qui afficher la liste des avertissements')
    .setRequired(true)
  )

// Emoji add

const emoji_addd = new discord.SlashCommandBuilder()
.setName('emoji-add')
.setDescription('Permet d\'ajouter un emoji externe dans votre serveur')
.addStringOption(option =>
  option.setName('emoji')
  .setDescription('emoji')
  .setRequired(true)
)

// Role perm
const role_perm = new discord.SlashCommandBuilder()
 .setName('role-perm')
 .setDescription('Ajoute un rôle permanent à un utilisateur.')
 .addUserOption(option =>
  option.setName('membre')
      .setDescription('Le membre à qui ajouter le rôle.')
      .setRequired(true)
    )
.addRoleOption(option =>
  option.setName('role')
      .setDescription('Le rôle à ajouter.')
      .setRequired(true)
    )

// Role remove perm 

const role_remove_perm = new discord.SlashCommandBuilder()
 .setName('role-perm-remove')
 .setDescription('Supprime un rôle permanent d\'un utilisateur.')
 .addUserOption(option =>
  option.setName('membre')
      .setDescription('Le membre à qui retirer le rôle.')
      .setRequired(true)
    )

const rerollGiveaway = new discord.SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Permet de rejouer la selection d\'un giveaway avec sont id.')
    .addStringOption(option => 
      option.setName('giveaway_id')
      .setDescription('Id du giveawya')
    )
///////////////////////////////////////////////////////////////////////////////
                            // SELECTEUR MENU //
///////////////////////////////////////////////////////////////////////////////



// permet de charger les commandes 
const commands = [
    help.toJSON(),
    setupantiraid.toJSON(),
    setuplog.toJSON(),
    setupwelcome.toJSON(),
    messagereac.toJSON(),
    lock_commmande.toJSON(),
    unlock_commmande.toJSON(),
    ban_commmande.toJSON(),
    unban_commmande.toJSON(),
    kick_commande.toJSON(),
    giveaway.toJSON(),
    blacklistt.toJSON(),
    unblacklistt.toJSON(),
    setup_statut.toJSON(),
    warn_add.toJSON(),
    warn_remove.toJSON(),
    warn_list.toJSON(),
    emoji_addd.toJSON(),
    role_perm.toJSON(),
    role_remove_perm.toJSON(),
    rerollGiveaway.toJSON()
    // warn_command.toJSON()
  ];
  
  const rest = new discord.REST({ version: '10' }).setToken(config.token);
  
  try {
    console.log("\x1b[32m",'Lancement de l\'actualisation des commandes de l\'application (/)');
  
    rest.put(discord.Routes.applicationCommands(config.client_id), { body: commands });
  
    console.log("\x1b[32m", 'Commandes d\'application (/) rechargées avec succès..\n====== Bot is Ready ======');
  } catch (error) {
    console.error(error);
  }


client.once('ready', async () => {
  const guilds = client.guilds.cache.map(guild => guild.name).join('\n> ');
    console.log(`- Connecté en tant que ${client.user.tag}!`)
    console.error(`
      ⚠️⚠️⚠️
      🔴🔴🔴 ATTENTION 🔴🔴🔴
      🔺🔺🔺 IL SE PEUT QUE LE BOT MÊME APRÈS L'AFFICHAGE DU PING, DES COMMANDES & EVENTS NE SOIT PAS ENCORE CHARGÉ ! 🔺🔺🔺
      ⚠️⚠️⚠️
      `);
      while(true){
        client.user.setActivity(` ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} membres`, {
            type: 1,
            url: "https://www.twitch.tv/la_fraude67"    
          });

          await new Promise(resolve => setTimeout(resolve, 12));
          console.log("\x1b[35m", `🏓 Ping : ${client.ws.ping} ms`)
          await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }  
  )
///////////////////////////////////////////////////////////////////////////////
                            // PARTIE ANTICRASH //
///////////////////////////////////////////////////////////////////////////////

const CHANNEL_ID = config.antiraid_channel_id;
function sendErrorEmbed(channel, title, description) {
  const embed = new discord.EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#FF0000')
      .setTimestamp();
  
  channel.send({ embeds: [embed] });
}

// Gestion des exceptions non capturées
process.on('uncaughtException', (err) => {
  console.error('Une exception non capturée a été détectée:', err);
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel) {
      sendErrorEmbed(channel, 'Une exception non capturée est survenue', `\`\`\`${err.message}\`\`\``);
  }
});
// Gestion des promesses rejetées non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Une promesse rejetée non capturée a été détectée:', promise, 'raison:', reason);
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel) {
      sendErrorEmbed(channel, 'Une promesse rejetée non capturée', `\`\`\`${reason}\`\`\``);
  }
});

// Partie LOADING

const loadedCommands = [];
const loadedEvents = [];
let isLoading = true;

function loadFiles(dir, type, targetArray) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    let allLoaded = true;

    files.forEach(file => {
        const filePath = path.join(__dirname, dir, file);
        try {
            const item = require(filePath);
            console.log(`${chalk.greenBright('✅')} ${chalk.bold.white(file)} ${chalk.cyan(`(${type})`)} ${chalk.green('chargé avec succès.')}`);
            targetArray.push(item);
        } catch (error) {
            console.error(`${chalk.redBright('❌')} ${chalk.bold.white(file)} ${chalk.cyan(`(${type})`)} ${chalk.red('n\'a pas pu être chargé :')}\n${chalk.gray(error.message)}`);
            allLoaded = false;
        }
    });

    return allLoaded;
}

function verifyLoadedItems(items, itemType) {
    items.forEach((item, index) => {
        try {
            if (item.isReady && !item.isReady()) {
                throw new Error(`${itemType} non prêt.`);
            }
            console.log(`${chalk.greenBright('✅')} ${chalk.bold.white(`${itemType} ${index + 1}`)} ${chalk.green('opérationnel.')}`);
        } catch (error) {
            console.error(`${chalk.redBright('❌')} ${chalk.bold.white(`${itemType} ${index + 1}`)} ${chalk.red('non opérationnel :')}\n${chalk.gray(error.message)}`);
        }
    });
}

console.log(chalk.yellow(figlet.textSync('BY LAFRAUDE', { horizontalLayout: 'default' })));

const loadingTimeout = setTimeout(() => {
    if (isLoading) {
        console.log(chalk.yellow.bold('\n⏳ Le bot est encore en train de se lancer, veuillez patienter...'));
    }
}, 1000);

console.log(chalk.blue.bold('\nChargement des commandes...'));
const commandsLoaded = loadFiles('commands', 'commande', loadedCommands);

console.log(chalk.blue.bold('\nChargement des événements...'));
const eventsLoaded = loadFiles('events', 'événement', loadedEvents);

if (commandsLoaded && eventsLoaded) {
    console.log(chalk.green.bold('\n🚀 Toutes les commandes et événements ont été chargés avec succès.'));
} else {
    console.log(chalk.red.bold('\n⚠️ Certains fichiers n\'ont pas été chargés correctement.'));
}

setTimeout(() => {
    isLoading = false;
    clearTimeout(loadingTimeout);

    console.log(chalk.magenta.bold('\nVérification des commandes et événements après lancement...'));
    verifyLoadedItems(loadedCommands, 'Commande');
    verifyLoadedItems(loadedEvents, 'Événement');

    console.log(chalk.magenta.bold('\nVérification terminée. Attendez l\'affichage du ping pour confirmer que le bot est lancé.'));
  }, 10);

// NE PAS MODIFIER
client.login(config.token)
  .catch("Erreur sur le token" + console.error);
