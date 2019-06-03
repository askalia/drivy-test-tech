const percent = require('percent-value');
const Level3 = require('../level3/level3');

class Level4 extends Level3 {

    constructor(options){
        super(options);
        this._actionsRulesRates = this.loadActionsRulesRates();
        this._actionsRules = this.loadActionsRules();                
    }

    loadActionsRulesRates(){
        return {
            OWNER_RATE : 70, // %
            INSURANCE_RATE : 50 // %
        };
    }

    loadActionsRules(){
        return {
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
                    amount : reportEntry.price - percent(100 - this._actionsRulesRates.OWNER_RATE).from(reportEntry.price)
                }
            },
            'insurance' : (reportEntry) => {
                const commission = percent(100 - this._actionsRulesRates.OWNER_RATE).from(reportEntry.price);
                return {
                    who: 'insurance',
                    type: 'credit',
                    amount : commission - Math.ceil(percent(this._actionsRulesRates.INSURANCE_RATE).from(commission))
                    
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
    }

    findActionByWho(actions){
        return (who) => actions.find(action => action.who === who)
    }

    getActionsRules(key = null){
        if (key !== null && ! (key in this._actionsRules)){
            throw new Error(`Rule '${key}' doest not exist`);
        }
        return key !== null ? this._actionsRules[key] : this._actionsRules;
    }

    createReportEntry(id) {
        return {
            ...super.createReportEntry(id, 0),
            actions: {}
        }        
    }
    
    allocateCommissionsToStakeholders(reportEntry, rental){
        
        reportEntry.actions = [
                this.getActionsRules('driver')(reportEntry),
                this.getActionsRules('owner')(reportEntry),
                this.getActionsRules('insurance')(reportEntry),
                this.getActionsRules('assistance')(reportEntry, this.getRentalDuration(rental)),
        ];
        const baseCommission = percent(100 - this._actionsRulesRates.OWNER_RATE ).from(reportEntry.price);
        reportEntry.actions.push(
            this.getActionsRules('drivy')(baseCommission, this.findActionByWho(reportEntry.actions))
        )
        const { price, commission, ..._reportEntry } = reportEntry;
        return _reportEntry;
    }

    getRentalsReport() {
        // we get and override the report so as to append 'commission' child object
        return super.getRentalsReport()
                    .map((reportEntry) => {            
                        return this.allocateCommissionsToStakeholders(reportEntry, this.findRentalById(reportEntry.id));                        
                    });        
    }
}

module.exports = Level4;