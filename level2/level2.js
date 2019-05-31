const Level = require("../core/level");
const moment = require("moment");
const percent = require("percent-value");

class Level2 extends Level {
  constructor(options) {
    super(options);
  }

  getTresholds() {
    return {
        // treshold : discount rate
        map : {
            0: 0,
            1: 10,
            4: 30,
            10: 50
        },
        // discountRate : satisfiable condition
        rules : {            
            0: nthDay => nthDay <= 1,
            10: nthDay => nthDay >1 && nthDay <= 4,
            30: nthDay => nthDay > 4 && nthDay <= 10,
            50: nthDay =>  nthDay > 10
        }
    }
  }

  getRentalDuration(rental) {
    return (
      moment(rental.end_date)
        .endOf("day")
        .diff(moment(rental.start_date).startOf("day"), "days") + 1
    );
  }

  computePrice(rental, car) {
    const operations = [
      function computeTimeAspect(rental) {
        const tresholdMap = this.getTresholds().map;
        const duration = this.getRentalDuration(rental);
        const discountMap = [0, ...Object.values(tresholdMap)].reduce((map, discountRate) => {
          map[discountRate] = 0;
          return map;
         }, {});
         
        const tresholdRules = this.getTresholds().rules; 
        for (let nthDay = 1; nthDay <= duration; nthDay++) {
          Object.keys(tresholdRules).forEach(rate => {
            if (tresholdRules[rate](nthDay) === true){
               discountMap[rate] ++;
            }
          });
        }

        const total = Object.entries(discountMap).reduce((accPrice, [discountRate, nbDays]) => {
          const discountedPricePerDay = (car.price_per_day - percent(discountRate).from(car.price_per_day));
           accPrice += parseInt(nbDays) * parseFloat(discountedPricePerDay);
          return accPrice;
        }, 0);
        return total;
      },
      function computeDistanceAspect(rental, car) {
        const distPrice = parseInt(rental.distance) * parseInt(car.price_per_km);
        return distPrice;
      }
    ];
    return operations
      .map(operation => operation.bind(this))
      .reduce((totalPrice, op) => totalPrice += op(rental, car), 0);  
  }
}

module.exports = Level2;