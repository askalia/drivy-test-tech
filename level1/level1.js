const { Level } = require('../core/level.js');

export class Level1 extends Level {

    constructor(options){
        super(options)        
    }

    computePrice(rental, car) {
        return this._loadOperations(__dirname)
            .reduce((totalPrice, operation) => {
                totalPrice += operation(rental, car);
                return totalPrice;
            }, 0);

    }
}
