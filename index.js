const { convertCsvToMeusDividendos, convertCsvCryptoToMeusDividendos } = require('./helpers');

const listCommands = ['ctmd', 'cctmd'];

function help() {
  console.info('Default commands: fv, ctmd, filePath');
  console.info(`
    \t--ctmd -> convert Csv To Meus Dividendos
    \n\t--cctmd -> convert Csv Crypto To Meus Dividendos
    \n\t--filePath -> File location
    \n\t--is-us-ticket -> is US ticket
  `);
  console.info('Sample: node index.js --fv --filePath=C:\\Users\\vinic\\Desktop\\ordens.csv');
}

async function execute() {
  help();
  let filePath = process.argv.find(a => a.startsWith('--filePath'));
  const isUSTicket = Boolean(process.argv.find(a => a.startsWith('--is-us-ticket')));
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

  if (command === '--ctmd') await convertCsvToMeusDividendos(filePath, isUSTicket);
  else if (command === '--cctmd') await convertCsvCryptoToMeusDividendos(filePath);

}

execute()
  .catch(e => console.error(e));