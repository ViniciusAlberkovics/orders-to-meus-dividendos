const { fixValues, convertCsvToMeusDividendos } = require('./helpers');

const listCommands = ['fv', 'ctmd'];

function help(){
  console.info('Default commands: fv, ctmd, filePath');
  console.info('\t--fv -> fixValues\n\t--ctmd -> convert Csv To Meus Dividendos\n\t--filePath -> File location');
  console.info('Sample: node index.js --fv --filePath=C:\\Users\\vinic\\Desktop\\ordens.csv');
}

async function execute() {
  help();
  let filePath = process.argv.find(a => a.startsWith('--filePath'));
  let command = '';

  listCommands.forEach(lc => {
    let existsCommand = process.argv.find(a => a.startsWith(`--${lc}`));
    if (existsCommand) command = existsCommand;
  })

  if (!filePath) {
    console.error('File is required.');
    process.exit(0);
  }

  if (!command) {
    console.error('Command is required.');
    process.exit(0);
  }

  filePath = filePath.split(/=|\s/gm)[1];

  if (command === '--fv') await fixValues(filePath);
  else if (command === '--ctmd') await convertCsvToMeusDividendos(filePath);

}

execute()
  .catch(e => console.error('Deu Merda!', e));