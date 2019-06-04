const Level = require('../core/level.js');

class Level1 extends Level {
    computePrice(rental, car) {
        const operations = [
            function computeTimeAspect(rental) {
                return rental.duration * car.price_per_day;
            },
            function computeDistanceAspect(rental, car) { 
                return rental.distance * car.price_per_km
            }
        ];
        return operations.reduce((totalPrice, op) => {
            totalPrice += op(rental, car);
            return totalPrice;
        }, 0);

    }
}

module.exports = Level1;