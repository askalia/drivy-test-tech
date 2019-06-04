const percent = require("percent-value");

export default {
    'insurance_fee' : (amount) => {
        const FEE_RATE = 50; // %
        return Math.ceil(percent(FEE_RATE).from(amount));
    },
    'assistance_fee' : (amount, rentalDuration) => {
        const FEE_PER_DAY  = 100; // c/€ per day;
        return (rentalDuration * FEE_PER_DAY);
    },
    'drivy_fee' : (amount) => amount            
};
