const Level5 = require('./level5');

new Level5({ dataPath: "./data/input.json" })
    .saveReport("./data/output.json", 'rentals', ({ message }) => console.log(message));
