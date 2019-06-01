const percent = require('percent-value');
const Level3 = require('../level3/level3');

class Level4 extends Level3 {

    constructor(options){
        super(options);

        this.OWNER_GAIN = 70;
        this.INSURANCE_RATE = 50;

        this._actionsRules = {
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
                    amount : reportEntry.price - percent(100 - this.OWNER_GAIN).from(reportEntry.price)
                }
            },
            'insurance' : (reportEntry) => {
                const commission = percent(100 - this.OWNER_GAIN).from(reportEntry.price);
                return {
                    who: 'insurance',
                    type: 'credit',
                    amount : commission - Math.ceil(percent(this.INSURANCE_RATE).from(commission))
                    
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
    
    appendTransactionsDetailToReportEntry(reportEntry, rental){
        const _getBaseCommissionOnRevenue = (reportEntry) => {
            const FEE_COMMISSION = 30;
            return percent(FEE_COMMISSION).from(reportEntry.price);
        }

        const _dispatchTransactionsDetailToStakeHolders = (baseCommission) => {
            
            const commission = percent(100 - this.OWNER_GAIN).from(reportEntry.price);
            let actions = [];
            
            actions.push(this.getActionsRules('driver')(reportEntry));
            actions.push(this.getActionsRules('owner')(reportEntry));
            actions.push(this.getActionsRules('insurance')(reportEntry));
            actions.push(this.getActionsRules('assistance')(reportEntry, this.getRentalDuration(rental))); 
            actions.push(this.getActionsRules('drivy')(commission, this.findActionByWho(actions)));

            return actions;
        }
        reportEntry.actions = _dispatchTransactionsDetailToStakeHolders(_getBaseCommissionOnRevenue(reportEntry));
        return reportEntry;
    }
    

    getRentalsReport() {
        // we get and override the report so as to append 'commission' child object
        return super.getRentalsReport()
        .map((reportEntry) => {
            this.appendTransactionsDetailToReportEntry(reportEntry, this.findRentalById(reportEntry.id))
            const { price, commission, ..._reportEntry } = reportEntry;
            return _reportEntry;
        });        
    }
}

module.exports = Level4;