const moment = require('moment');
moment.suppressDeprecationWarnings = true;

const Level = require('../core/level.js');

class Level1 extends Level {
    computePrice(rental, car) {
        const operations = [
            function computeTimeAspect(rental) {
                const countRentalDuration = () => moment(rental.end_date).endOf("day").diff(moment(rental.start_date).startOf("day"), 'days') + 1;
                return countRentalDuration() * car.price_per_day
            },
            function computeDistanceAspect(rental, car) { return rental.distance * car.price_per_km }
        ];
        return operations.reduce((totalPrice, op) => {
            totalPrice += op(rental, car);
            return totalPrice;
        }, 0);

    }
}

module.exports = Level1;