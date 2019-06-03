const Level2 = require('./level2');

new Level2({ dataPath: "./data/input.json" })
    .saveReport("./data/output.json", 'rentals', ({ message }) => console.log(message));
