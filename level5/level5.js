const percent = require('percent-value');
const Level4 = require('../level4/level4');

class Level5 extends Level4 {

    constructor(options){
        super(options);

        this._optionsRules = {
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
        };
    }

    createReportEntry(id) {
        return {
            ...super.createReportEntry(id, 0),
            options: []            
        }        
    }

    getOptionsRules(key){
        const EMPTY_RULE = () => ({ payee : [], cost: 0 }); 
        return this._optionsRules[key] || EMPTY_RULE;
    }

    findRentalOptions(rentalId){
        return (this._data.options || [])
            .filter(option => option.rental_id === rentalId)
            .map(option => option.type)
    }

    debitOrCreditStakeholders(reportEntry){
        const rental = this.findRentalById(reportEntry.id)
            const rentalDuration = this.getRentalDuration(rental);
            reportEntry.options = this.findRentalOptions(rental.id);
            
            reportEntry.options.forEach(optionType => {
                const optionMetadata = this.getOptionsRules(optionType)(rentalDuration);
                const driverAction = reportEntry.actions.find(action => action.who === 'driver');
                optionMetadata.payee.forEach(payeeName => {    
                    driverAction.amount += optionMetadata.cost; 
                    const payee = reportEntry.actions.find(action => action.who === payeeName);
                    payee.amount += optionMetadata.cost;                     
                })
                
            })
            return reportEntry;
    }
    
    getRentalsReport() {
        // we get and override the report so as to append stakeholders to 'debit or credit'
        return super.getRentalsReport()
                    .map(this.debitOrCreditStakeholders.bind(this))
    }
}

module.exports = Level5;