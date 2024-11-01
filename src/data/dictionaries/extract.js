const fs = require('fs');

// Load data from both JSON files
const bldData = JSON.parse(fs.readFileSync('bld.json', 'utf8'));
const uscData = JSON.parse(fs.readFileSync('usc.json', 'utf8'));

// Combine the data into a single array
const combinedData = [...bldData, ...uscData];

// Create a map to store JSON objects by letter
const jsonObjectByLetter = new Map();

// Iterate through the combined data and group objects by letter
for (const obj of combinedData) {
  const letter = obj.letter; 
  if (!jsonObjectByLetter.has(letter)) {
    jsonObjectByLetter.set(letter, []);
  }
  jsonObjectByLetter.get(letter).push(obj);
}

// Write each group of objects to a separate JSON file
for (const [letter, objects] of jsonObjectByLetter.entries()) {
  const fileName = `dict-${letter.toLowerCase()}.json`; 
  fs.writeFileSync(fileName, JSON.stringify(objects, null, 2)); 
  console.log(`Extracted objects with letter '${letter}' to ${fileName}`);
}