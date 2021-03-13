const csv = require('async-csv');
const fs = require('fs');
const { sep } = require('path');
const ObjectsToCsv = require('objects-to-csv');

async function parser(filePath) {
  const csvString = fs.readFileSync(filePath);
  const obj = await csv.parse(csvString)
  return obj;
}

/**
 * 
 * @param {[]} order 
 */
function fixValues(order) {
  let ticket = 0, dt = 1, unitVl = 2, qnt = 3, tp = 4, expenditure = 5;
  let unitVlFinal = Number(order[unitVl].replace(',', '.')).toFixed(2).replace('.', ',');
  let expenditureFinal = Number(order[expenditure].replace(',', '.')).toFixed(2).replace('.', ',');
  return [
    order[ticket],
    order[dt],
    `${unitVlFinal}`,
    order[qnt],
    order[tp],
    expenditureFinal
  ]
}

async function execute(filePath) {
  console.info('Started!');
  const orders = await parser(filePath);
  console.log(orders.length)

  let converted = orders.map((order, i) => {
    let value = fixValues(order);
    console.log(i + 1, '-', orders.length);
    return value;
  });

  console.log('generate file')
  let paths = filePath.split(/\\|\//gm);
  paths[paths.length -1] = 'final_' + paths[paths.length -1];
  let loc = paths.join(sep);
  await new ObjectsToCsv(converted).toDisk(loc, {});

  let file = fs.readFileSync(loc, 'utf-8')
  let lines = file.split(/\r?\n/);
  fs.writeFileSync(loc, lines.splice(1).join('\r\n'));

  console.log('location: ', loc);
  console.info('Finished!');
}

module.exports = execute;