const { Level } = require("../core/level");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;

const percent = require("percent-value");

export class Level2 extends Level {
  constructor(options) {
    super(options);
    this._tresholds = this._loadTresholds();
  }

  _loadTresholds(){
      return require('./lib/tresholds.lib').default;
  }

  computePrice(rental, car) {
    return this._loadOperations(__dirname)
            .reduce((totalPrice, operation) => totalPrice += operation(rental, car), 0);  
  }
}
