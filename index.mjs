import fs from 'node:fs/promises'

function addToMap(month, month_map) {
  for (const entry of month) {
    const id = entry.split(',')[0];

    if (month_map.has(id)) {
      console.warn(`id ${id} already exists with entry ${entry}`)
      continue;
    }

    month_map.set(id, entry);
  }
}

const month_a =
  (await fs.readFile('archivedData/IHKBerlin_Gewerbedaten_03-2023.csv', { encoding: 'utf8' }))
  .split('\n');
month_a.shift();

const month_a_map = new Map();
addToMap(month_a, month_a_map)

const month_b =
  (await fs.readFile('archivedData/IHKBerlin_Gewerbedaten_04-2023.csv', { encoding: 'utf8' }))
    .split('\n')
month_b.shift();

const month_b_map = new Map();
addToMap(month_b, month_b_map)

const changed_map= new Map();

console.time('iterate');
for (let month_a_index = 0; month_a_index < month_a.length; month_a_index++) {
  const entryA = month_a[month_a_index];
  const entryId = entryA.split(',')[0];

  // add the next line to see progress
  // process.stdout.write(`\rmonth_a:${month_a_index}/${month_a.length}, month_a_map: ${month_a_map.size} month_b_map: ${month_b_map.size}`)

  const entryB = month_b_map.get(entryId)
  if (!entryB) {
    continue;
  }

  if (entryA !== entryB) {
    changed_map.set(entryId, `${entryA.replace('\r', '')},${entryB}`);
  }

  month_a_map.delete(entryId);
  month_b_map.delete(entryId);
}

console.timeEnd('iterate');
fs.appendFile('./results/07_july_deleted.csv', [...month_a_map.values()])
fs.appendFile('./results/07_july_added.csv', [...month_b_map.values()])
fs.appendFile('./results/07_july_modified.csv', [...changed_map.values()])
