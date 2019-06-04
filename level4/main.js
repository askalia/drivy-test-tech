const { Level4 } = require('./level4');

new Level4({ dataPath: "./data/input.json" })
    .saveReport("./data/output.json", 'rentals', ({ message }) => console.log(message));
