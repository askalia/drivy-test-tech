
const Level1 = require('./level1.js');

new Level1({ dataPath: './data/input.json' }).saveReport('./data/output.json', 'rentals');
