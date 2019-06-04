const Level = require("../core/level");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;

const percent = require("percent-value");

class Level2 extends Level {
  constructor(options) {
    super(options);
  }

  getTresholds() {
      // discountRate : satisfiable condition
    return {            
        0: (nthDay) => nthDay <= 1,
        10: (nthDay) => nthDay >1 && nthDay <= 4,
        30: (nthDay) => nthDay > 4 && nthDay <= 10,
        50: (nthDay) =>  nthDay > 10
    };
  }

  computePrice(rental, car) {
    const operations = [
      function computeTimeAspect(rental) {
        
        const _groupDurationsByTreshold = (duration) => {            
            const tresholds = this.getTresholds();
            const discountMap = {};
            for (let nthDay = 1; nthDay <= duration; nthDay++) {
                Object.keys(tresholds).forEach(rate => {
                    if (tresholds[rate](nthDay) === true){
                        discountMap[rate] = (discountMap[rate] || 0) +1;
                    }
                });
            }
            return discountMap;
        }
        
        // map sliced durations with applicable discount rate
        const _mapSlicedDurationsWithApplicableRate = (discountMap) => {
            return Object.entries(discountMap)
                         .reduce((accPrice, [discountRate, nbDays]) => {
                            const discountedPricePerDay = (car.price_per_day - percent(discountRate).from(car.price_per_day));
                            accPrice += parseInt(nbDays) * parseFloat(discountedPricePerDay);
                            return accPrice;
                        }, 0);
        }
        return _mapSlicedDurationsWithApplicableRate(_groupDurationsByTreshold(rental.duration));
      },

      function computeDistanceAspect(rental, car) {
        return parseInt(rental.distance) * parseInt(car.price_per_km);        
      }
    ];
    return operations
      .reduce((totalPrice, operation) => totalPrice += operation.bind(this)(rental, car), 0);  
  }
}

module.exports = Level2;