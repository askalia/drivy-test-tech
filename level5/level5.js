const { ReportEntry } = require('../core/models');
const { Level4 } = require('../level4/level4');

export class Level5 extends Level4 {

    constructor(options){
        super(options);
        this._optionsRules = this._loadOptionsRules()
    }
    
    _loadOptionsRules(){
        return require('./lib/options-rules.lib').default;
    }

    getOptionRule(key){
        const EMPTY_RULE = () => ({ payee : [], cost: 0 }); 
        return this._optionsRules[key] || EMPTY_RULE;
    }

    debitOrCreditStakeholders(reportEntry){
        const rental = this._rentalFlowService.findRentalById(reportEntry.id)
        
            const rentalDuration = rental.duration;            
            ReportEntry.withOptions(reportEntry).options = rental.options;
            reportEntry.options.forEach(optionType => {

                const optionMetadata = this.getOptionRule(optionType)(rentalDuration);
                const driverAction = reportEntry.actions.find(action => action.who === 'driver');
                optionMetadata.payee.forEach(payeeName => {    
                    // driver is charged for every given cost
                    driverAction.amount += optionMetadata.cost; 
                    // point out the payee to credit the cost on
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
