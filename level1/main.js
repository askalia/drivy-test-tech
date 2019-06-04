
const Level1 = require('./level1.js');

new Level1({ dataPath: __dirname +'/data/input.json' })
    .saveReport('./data/output.json', 'rentals', ({ message }) => console.log(message));
