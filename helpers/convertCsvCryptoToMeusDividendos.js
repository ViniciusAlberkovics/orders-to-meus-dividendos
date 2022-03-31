const csv = require('async-csv');
const fs = require('fs');
const { sep } = require('path');
const ObjectsToCsv = require('objects-to-csv');

const positions = Object.freeze({
  CORRETORA: 0,
  TICKET: 1,
  TP_ORDEM: 2,
  DT_COMPRA: 3,
  QNTDD: 4,
  VALOR_UNIT: 5,
  VALOR_TTL: 6,
})

async function parser(filePath) {
  const csvString = fs.readFileSync(filePath);
  const obj = await csv.parse(csvString)
  return obj;
}

function replace(value) {
  return value.replace('$', '').replace(',', '.');
}


/**
 * @param {[]} order 
 */
function getValues(order) {
  const unitVlFinal = Number(replace(order[positions.VALOR_UNIT])).toFixed(8).replace('.', ',');
  const expenditureFinal = (0).toFixed(2).replace('.', ',');
  const purchaseDt = order[positions.DT_COMPRA].split('/').reduce((agg, current) => {
    if (current.length < 2) return [...agg, "0" + current];
    return [...agg, current];
  }, []).join('/');

  return [
    order[positions.TICKET],
    purchaseDt,
    unitVlFinal,
    Number(order[positions.QNTDD]).toFixed(10).replace('.', ','),
    order[positions.TP_ORDEM] === 'C' ? 'Compra' : 'Venda',
    expenditureFinal
  ]
}

async function execute(filePath) {
  console.info('Started!');
  let orders = (await parser(filePath)).splice(1);
  orders = orders.filter(o => o[positions.TP_ORDEM] !== 'B' && o[positions.TP_ATIVO] !== 'RENDA FIXA');
  console.log(orders.length)

  let converted = orders.map((order, i) => {
    let value = getValues(order);
    console.log(i + 1, '-', orders.length);
    return value;
  });

  console.log('generate file')
  let paths = filePath.split(/\\|\//gm);
  paths[paths.length - 1] = 'import_' + paths[paths.length - 1];
  let loc = paths.join(sep);
  await new ObjectsToCsv(converted).toDisk(loc, {});

  let file = fs.readFileSync(loc, 'utf-8');
  let lines = file.split(/\r?\n/);
  fs.writeFileSync(loc, lines.splice(1).join('\r\n'));

  console.log('location: ', loc);
  console.info('Finished!');
}

module.exports = execute;