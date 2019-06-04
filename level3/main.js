const { Level3 } = require('./level3');

new Level3({ dataPath: "./data/input.json" })
    .saveReport("./data/output.json", 'rentals', ({ message }) => console.log(message));
