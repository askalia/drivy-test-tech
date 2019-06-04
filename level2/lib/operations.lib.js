const percent = require("percent-value");

export function computeTimeAspect(rental, car) { 
    const _groupDurationsByTreshold = (duration) => {            
        const tresholds = this._tresholds;
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
};

export function computeDistanceAspect(rental, car) {
    return parseInt(rental.distance) * parseInt(car.price_per_km);        
}