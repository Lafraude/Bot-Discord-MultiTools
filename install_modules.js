const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ message: `Erreur : ${error.message}`, stderr });
      }
      const filteredStderr = stderr.split('\n').filter(line => !line.includes('npm warn')).join('\n');
      if (filteredStderr) {
        console.error(`Erreur : ${filteredStderr}`);
      }
      const warnings = stderr.split('\n').filter(line => line.includes('npm warn')).join('\n');
      if (warnings) {
        console.warn(`Avertissements : ${warnings}`);
        console.error('Veuillez d\'abord exécuter `npm update` pour résoudre les avertissements ci-dessus.');
      }
      resolve(stdout);
    });
  });
}

async function installDependencies() {
  try {
    console.log('Installation des dépendances...');
    const result = await runCommand('npm install');
    console.log(result);
    console.log('Toutes les dépendances ont été installées avec succès.');
  } catch (error) {
    console.error(`Échec de l'installation : une erreur est survenue.`);
    console.log('Tentative de résolution : suppression du dossier node_modules et relance de l\'installation.');

    const nodeModulesPath = path.resolve('node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmdirSync(nodeModulesPath, { recursive: true });
      console.log('Dossier node_modules supprimé avec succès.');
    } else {
      console.log('Le dossier node_modules n\'existe pas.');
    }

    try {
      console.log('Relance de npm install...');
      const result = await runCommand('npm install');
      console.log(result);
      console.log('Toutes les dépendances ont été installées avec succès.');
    } catch (installError) {
      console.error(`Échec de l'installation après suppression de node_modules : une erreur est survenue.`);
    }
  }
}

installDependencies();
