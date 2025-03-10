const fs = require('fs');
const readline = require('readline');

function loadDictionary(filePath) {
    return new Promise((resolve, reject) => {
        const dictionary = new Set();
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath, { encoding: 'utf8' }),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const word = line.trim()
                  .toLowerCase()
                  .replace(/ά/g, 'α')
                  .replace(/έ/g, 'ε')
                  .replace(/ή/g, 'η')
                  .replace(/ί/g, 'ι')
                  .replace(/ϊ/g, 'ι')
                  .replace(/ό/g, 'ο')
                  .replace(/ύ/g, 'υ')
                  .replace(/ώ/g, 'ω');
            if (word.length === 8) {
              dictionary.add(word);
            }
        });

        rl.on('close', () => {
            resolve(dictionary);
        });

        rl.on('error', (error) => {
            reject(error);
        });
    });
}

function parseGreekLex(filePath, dictionary) {
    return new Promise((resolve, reject) => {
        const wordFrequencies = {};
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath, { encoding: 'utf8' }),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const columns = line.split('\t');
            if (columns.length >= 5) { // Ensure we have enough columns
                const word = columns[1].replace(/[^α-ωΑ-Ωάέόήίύώϊ]/g, '')
                  .toLowerCase()
                  .replace(/ά/g, 'α')
                  .replace(/έ/g, 'ε')
                  .replace(/ή/g, 'η')
                  .replace(/ί/g, 'ι')
                  .replace(/ϊ/g, 'ι')
                  .replace(/ό/g, 'ο')
                  .replace(/ύ/g, 'υ')
                  .replace(/ώ/g, 'ω');
                if (word.length !== 8 || !dictionary.has(word)) {
                  return;
                }
                const wordFreq = parseInt(columns[2], 10);
                wordFrequencies[word] = wordFrequencies[word] !== undefined && wordFrequencies[word] > wordFreq ? wordFrequencies[word] : wordFreq;
            }
        });

        rl.on('close', () => {
            resolve(wordFrequencies);
        });

        rl.on('error', (error) => {
            reject(error);
        });
    });
}

async function main() {
    try {
        const filePath = 'corpus.txt'; // Replace with your file path
        const dictionaryPath = 'greek-dictionary.txt';
        const dictionary = await loadDictionary(dictionaryPath);
        const wordFrequencies = await parseGreekLex(filePath, dictionary);
        const jsonOutput = JSON.stringify(Object.entries(wordFrequencies).sort((a, b) => b[1] - a[1]));
        fs.writeFileSync('./app/words.json', jsonOutput, 'utf8');
        console.log('JSON file generated successfully.');
    } catch (error) {
        console.error('Error parsing file:', error);
    }
}

main();

