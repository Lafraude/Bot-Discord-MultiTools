# Rejoignez-nous sur Discord
Pour toutes questions, suggestions, ou simplement pour discuter avec la communauté, rejoignez-nous sur notre serveur Discord !

👉 [Rejoindre le serveur Discord](https://discord.gg/zykD35HXmH)

Nous serions ravis de vous y voir ! 😄

# 🌟 Présentation de **MxStory's** 🌟

Bienvenue sur la page de présentation de **MxStory's**, votre bot Discord tout-en-un ! 🎉  
Que vous soyez un administrateur cherchant à sécuriser votre serveur ou un modérateur souhaitant simplifier vos tâches quotidiennes, ce bot est conçu pour répondre à tous vos besoins.

## 🔒 Catégorie Antiraid

Protégez votre serveur contre les attaques et les abus grâce à ces fonctionnalités antiraid :

- **AntiMassCreate** : Empêche la création massive de salons.
- **AntiLink Discord** : Bloque les liens Discord non autorisés pour éviter le spam.

## 🛠️ Catégorie Modération

Gérez facilement les membres de votre serveur grâce à ces commandes de modération :

- **/ban** : Bannissez un utilisateur du serveur.
- **/unban** : Réintégrez un utilisateur banni.
- **/blacklist** : Ajoutez un utilisateur à la liste noire du serveur.
- **/unblacklist** : Retirez un utilisateur de la liste noire.
- **/lock** : Verrouillez un salon pour empêcher l'accès.
- **/unlock** : Déverrouillez un salon précédemment verrouillé.
- **/warn-add** : Ajoutez un avertissement à un utilisateur.
- **/warn-remove** : Retirez un avertissement d'un utilisateur.
- **/warn-list** : Consultez la liste des avertissements d'un utilisateur.

## ⚙️ Catégorie Utilitaire

Simplifiez l'administration de votre serveur avec ces commandes utilitaires :

- **/setup-log** : Configurez les logs pour suivre les activités du serveur.
- **/setup-antiraid** : Mettez en place les paramètres antiraid rapidement.
- **/giveaway** : Organisez facilement des giveaways pour votre communauté.
- **/mpall** : Envoyez un message privé à tous les membres du serveur.
- **!footer** : Modifiez la photo de profil de votre bot.
- **/role-perm** : Gérez les permissions des rôles.
- **/role-perm-remove** : Supprimez les permissions des rôles.
- **/mpjoinactivate**: Permet d\'activer ou non l\'envoi d\'un MP à l\'utilisateur qui rejoint le serveur.
- **/mpjoinconfig**: Permet de configurer le message envoyé à l\'utilisateur qui rejoint le serveur.
- **!say**: Utilisez cette commande pour que le bot envoie le message que vous avez écrit, tout en supprimant votre message original.
- **/setup-ticket**: Permet de créer un système de ticket

## Instructions d'Installation

Bonjour 👋,

Voici comment configurer le bot pour qu'il fonctionne sans problème ! 🚀

1. **Mettre à Jour les Dépendances**  
   Assurez-vous d'avoir les dernières versions des dépendances. Exécutez la commande suivante :
   
```bash
npm update
```
2. Installer les Modules
Avant de lancer le bot, exécutez le fichier `install_modules.js` avec la commande suivante :

```bash
node install_modules.js
```
3. Configurer Votre Bot
Allez dans le fichier `config.json`. ATTENTION : Il y a 3 fichiers à configurer : un dans commands, un dans events, et un dans le dossier principal. Vous devrez entrer le jeton de votre bot, l'ID client et l'ID du serveur dans les 3 fichiers ! 🔐

4. Lancer le Bot
Une fois tout configuré, démarrez le bot en exécutant :

```bash
node index.js
```
