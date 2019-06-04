const percent = require('percent-value');

export const rates = {
    OWNER_RATE : 70, // %
    INSURANCE_RATE : 50 // %
};

export const rules = {
    'driver' : (reportEntry) => {
        return {
            who: 'driver',
            type: 'debit',
            amount : reportEntry.price
        }
    },
    'owner' : (reportEntry) => {
        return {
            who: 'owner',
            type: 'credit',
            amount : reportEntry.price - percent(100 - rates.OWNER_RATE).from(reportEntry.price)
        }
    },
    'insurance' : (reportEntry) => {
        const commission = percent(100 - rates.OWNER_RATE).from(reportEntry.price);
        return {
            who: 'insurance',
            type: 'credit',
            amount : commission - Math.ceil(percent(rates.INSURANCE_RATE).from(commission))
            
        }
    },
    'assistance' : (reportEntry, rentalDuration) => {
        const FEE_PER_DAY  = 100; // c/€ per day;
        return {
            who: 'assistance',
            type: 'credit',
            amount: (rentalDuration * FEE_PER_DAY)
        }
    },
    'drivy' : (commission, actionFinder) => {                
        const whoSubstrac = ['insurance', 'assistance'];
        return {
            who: 'drivy',
            type: 'credit',
            amount: whoSubstrac.reduce((decAmount, who) => {
                decAmount -= actionFinder(who).amount;
                return decAmount;
            }, commission)                    
        }
    }
};