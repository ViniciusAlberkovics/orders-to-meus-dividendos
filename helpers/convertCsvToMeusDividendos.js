const csv = require('async-csv');
const fs = require('fs');
const { sep } = require('path');
const ObjectsToCsv = require('objects-to-csv');

const positions = Object.freeze({
  CORRETORA: 0,
  TP_ORDEM: 1,
  TICKET: 2,
  TP_MERCADO: 3,
  DT_COMPRA: 4,
  QNTDD: 5,
  VALOR_UNIT: 6,
  VALOR_TTL: 7,
  TX_LIQUIDACAO: 8,
  TX_BOLSA: 9,
  TX_CORRETORA: 10,
  VALOR_TTL_C_TX: 11,
  TP_ATIVO: 12,
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
 * 
 * @param {[]} order 
 */
function getValues(order) {
  const unitVlFinal = Number(replace(order[positions.VALOR_UNIT])).toFixed(2).replace('.', ',');
  const expenditureFinal = (Number(replace(order[positions.TX_LIQUIDACAO])) +
                            Number(replace(order[positions.TX_CORRETORA])) +
                            Number(replace(order[positions.TX_BOLSA])))
                            .toFixed(2).replace('.', ',');
  return [
    order[positions.TICKET],
    order[positions.DT_COMPRA],
    unitVlFinal,
    order[positions.QNTDD],
    order[positions.TP_ORDEM] === 'C' ? 'Compra' : 'Venda',
    expenditureFinal
  ]
}

async function execute(filePath) {
  console.info('Started!');
  let orders = (await parser(filePath)).splice(1);
  orders = orders.filter(o => o[positions.TP_ORDEM] !== 'B');
  console.log(orders.length)

  let converted = orders.map((order, i) => {
    let value = getValues(order);
    console.log(i + 1, '-', orders.length);
    return value;
  });

  console.log('generate file')
  let paths = filePath.split(/\\|\//gm);
  paths[paths.length - 1] = 'final_' + paths[paths.length - 1];
  let loc = paths.join(sep);
  await new ObjectsToCsv(converted).toDisk(loc, {});

  let file = fs.readFileSync(loc, 'utf-8');
  let lines = file.split(/\r?\n/);
  fs.writeFileSync(loc, lines.splice(1).join('\r\n'));

  console.log('location: ', loc);
  console.info('Finished!');
}

module.exports = execute;