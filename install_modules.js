const { exec } = require('child_process');
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Erreur : ${error.message}`);
      }
      if (stderr) {
        console.error(`Erreur : ${stderr}`);
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
    console.error(`Échec de l'installation : ${error}`);
  }
}

installDependencies();