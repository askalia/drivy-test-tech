export default {
    'gps' : (rentalDuration) => { 
        const FEES_PER_DAY = 5; // €
        return {
            payee: ['owner'],
            cost: rentalDuration * (FEES_PER_DAY * 100) // fees as c/€
        };
     },
    'baby_seat' : (rentalDuration) => { 
        const FEES_PER_DAY = 2; // €
        return {
            payee: ['owner'],
            cost: rentalDuration * (FEES_PER_DAY * 100) // fees as c/€
        };
     },
    'additional_insurance' : (rentalDuration) => { 
        const FEES_PER_DAY = 10; // €
        return {
            payee: ['drivy'],
            cost: rentalDuration * (FEES_PER_DAY *100) // fees as c/€
        }                
    }
}