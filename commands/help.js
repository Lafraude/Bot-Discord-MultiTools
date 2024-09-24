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

  module.exports = {
    name: 'help',
    init() {
        return new Promise((resolve, reject) => {
            // Simuler un délai d'initialisation
            setTimeout(() => {
                console.log('Commande initialisée.');
                resolve();
            }, 1000);
        });
    },
    execute() {
        console.log('Commande exécutée.');
    }
};


// help 
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
  
    const { commandName } = interaction;
  
    if (commandName === 'help') {
      const embed = new discord.Embed({
        color: 0xaf7ac5,
        title: 'Accueil',
        description: 'Vous êtes maintenant sur notre interface d\'aide dédiée. Ici, vous trouverez des réponses à vos questions ainsi que des guides détaillés sur les commandes. Utilisez le menu déroulant pour explorer les différents sujets.',
        fields: [
          {
            name: "Quelques liens utiles :",
            value: '> [Notre discord](https://discord.gg/zykD35HXmH)\n> [X(Twitter)](Soon)',
          }
        ],
        footer: {
          text: 'Choisissez une catégorie dans le sélecteur ci-dessous pour en consulter les commandes.'
        },
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/1243450407959789569/1267536826759909488/688e99a01f6d610b2eaadbd8d44307c3.png?ex=66a92529&is=66a7d3a9&hm=3c3318552afff235c665c9363b6ec46b75f28efa0281fbaa49fdbc9b38c4bc97&',
        }
      })
  
      const selectMenu = new discord.StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('Sélectionnez un type d\'aide')
        .addOptions([
          {
            emoji: '🛬',
            label: 'Welcome',
            description: 'Permet de savoir comment fonctionne la commande !',
            value: 'welcome_help',
          },
          {
            emoji:'🔨',
            label: 'Modération',
            description: 'Commandes de modération',
            value: 'commands_modo',
          },
          {
            emoji: '🛡️',
            label: 'Règles',
            description: 'Afficher les règles du serveur',
            value: 'rules_help',
          },
          {
            emoji: '🛠️',
            label: 'Utilitaires',
            description: 'Afficher les commandes du serveur',
            value: 'commandes_global',
          }
        ]);
  
      const row = new discord.ActionRowBuilder().addComponents(selectMenu);
  
      await interaction.reply({ embeds: [embed], components: [row] });
  
    }
  });
  
  client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
  
    const selectedValue = interaction.values[0];
    let embed;
    switch (selectedValue) {
      case 'welcome_help':
        embed = new discord.Embed({
          color: 0xaf7ac5,
          title: '/setup-welcome',
          description: '',
          fields: [
            {
              name: 'Utilisation',
              value: '/setup-welcome [channel] [rôles]',
            },
            {
              name: '[channel]',
              value: 'Vous devez spécifier le canal où vous voulez que le message soit envoyé !',
              inline: true,
            },
            {
              name: '[rôles]',
              value: 'Vous devez spécifier le rôle qui sera attribué automatiquement. Aucun rôle = everyone !',
              inline: true,
            }
          ],
        })
          
        break;
      case 'commands_modo':
        embed = new discord.Embed({
          color: 0xaf7ac5,
          title:'',
          description: '',
          fields: [
            {
              name: '',
              value: 
              '**/ban**: Bannir un utilisateur.' +
              '\n**/unban**: Débannir un utilisateur'+
              '\n**/kick**: Expluser un utilisateur.'+
              '\n**/warn-add**: Ajouter un warn a un utilisateur.'+
              '\n**/warn-remove**: Retire un warn a un membres.'+
              '\n**/warn-list**: Permet de voir les warns.'+
              '\n**/lock**: Lock un salon avec la raison.'+
              '\n**/unlock**: Unlock un salon.'+
              '\n**/blacklist**: Ban un membres de tout les discord.'+
              '\n**/unblacklist:** Unban un membres de tout les discord.'
            }],
        })
          
        break;
      case 'rules_help':
        embed = new discord.Embed({
          color: 0xaf7ac5,
          title: 'Règles du serveur',
          description: '',
          fields: [
            {
              name: '',
              value: 'Voici le salon où vous pouvez retrouver les règles du serveur. <#1260968987563393075>'
            }],
          })
        break;
        case 'rules_help':
          embed = new discord.Embed({
            color: 0xaf7ac5,
            title: 'Règles du serveur',
            description: '',
            fields: [
              {
                name: '',
                value: 'Voici le salon où vous pouvez retrouver les règles du serveur. <#1260968987563393075>'
              }],
            })
          break;
          case 'commandes_global':
            embed = new discord.Embed({
              color: 0xaf7ac5,
              title: 'Voici les commandes utiles pour le serveur !',
              description: '',
              fields: [
                {
                  name: '',
                  value:
                  '\n**/setup-log**: Permet de configurer les logs.'+
                  '\n**/setup-antiraid**: Permet de configurer le système antiraid.'+
                  '\n**!footer**: Permet de modifier la pp du bot'+
                  '\n**/giveaway**: Permet de crée un giveaway.'+
                  '\n**/emoji-add**: Permet d\'ajouter un emoji.'+
                  '\n**/role-perm**: Permet d\'ajouter un role permanent (Si l\'utilisateur quitte le serveur et revient, il aura toujours le rôle.)'+
                  '\n**/role-perm-remove**: Retire le role perm.' + 
                  '\n**/mpjoinactivate**: Permet d\'activer ou non l\'envoi d\'un MP à l\'utilisateur qui rejoint le serveur.' +
                  '\n**/mpjoinconfig**: Permet de configurer le message envoyé à l\'utilisateur qui rejoint le serveur.' + 
                  '\n**/setup-ticket**: Système de ticket simple.'                 
                }],
              })
            break;
            case 'accueil_help':
              embed = new discord.Embed({
                color: 0xaf7ac5,
                title: '🏠 Accueil',
                description: 'Vous êtes maintenant sur notre interface d\'aide dédiée. Ici, vous trouverez des réponses à vos questions ainsi que des guides détaillés sur les commandes. Utilisez le menu déroulant pour explorer les différents sujets.',
                fields: [
                  {
                    name: "Quelques liens utiles :",
                    value: '> [Notre discord](https://discord.gg/zykD35HXmH)\n> [X(Twitter)](Soon)',
                  }],
                  footer: {
                    text: 'Choisissez une catégorie dans le sélecteur ci-dessous pour en consulter les commandes.'
                  },
                  thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/1243450407959789569/1267536826759909488/688e99a01f6d610b2eaadbd8d44307c3.png?ex=66a92529&is=66a7d3a9&hm=3c3318552afff235c665c9363b6ec46b75f28efa0281fbaa49fdbc9b38c4bc97&',
                  }
                })
              break;
      default:
        embed = new discord.Embed()
          
    }
    // crée un bouton pour retourner a l'embed du dépard
      const selectMenu = new discord.StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('Sélectionnez un type d\'aide')
        .addOptions([
          {
            emoji: '🏠',
            label: 'Accueil',
            description: 'Accueil',
            value: 'accueil_help',
          },
          {
            emoji: '🛬',
            label: 'Welcome',
            description: 'Permet de savoir comment fonctionne la commande !',
            value: 'welcome_help',
          },
          {
            emoji:'🔨',
            label: 'Modération',
            description: 'Commandes de modération',
            value: 'commands_modo',
          },
          {
            emoji: '🛡️',
            label: 'Règles',
            description: 'Afficher les règles du serveur',
            value: 'rules_help',
          },
          {
            emoji: '🛠️',
            label: 'Utilitaires',
            description: 'Afficher les commandes du serveur',
            value: 'commandes_global',
          }
        ]);
  
    const row = new discord.ActionRowBuilder().addComponents(selectMenu);
  
  
    await interaction.update({ embeds: [embed], components: [row] });
  });

// NE PAS MODIFIER
client.login(config.token)
  .catch("Erreur sur le token indiquer dans le fichier commands / config.json" + console.error);

