const { ReportEntry } = require('../core/models');
const percent = require('percent-value');
const { Level3 } = require('../level3/level3');

export class Level4 extends Level3 {

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

    getActionRule(key){
        if (! (key in this._actionsRules)){
            throw new Error(`Rule '${key}' doest not exist`);
        }
        return this._actionsRules[key];
    }

    allocateCommissionsToStakeholders(reportEntry, rental){
        
        ReportEntry.withActions(reportEntry).actions = [
            this.getActionRule('driver')(reportEntry),
            this.getActionRule('owner')(reportEntry),
            this.getActionRule('insurance')(reportEntry),
            this.getActionRule('assistance')(reportEntry, rental.duration),
        ];

        const baseCommission = percent(100 - this._actionsRulesRates.OWNER_RATE ).from(reportEntry.price);
        reportEntry.actions.push(
            this.getActionRule('drivy')(baseCommission, reportEntry.findActionByWho.bind(reportEntry))
        )
        // we do not need price nor commission in reportEntry
        const { price, commission, ..._reportEntry } = reportEntry;
        return _reportEntry;
    }

    getRentalsReport() {
        // we get and override the report so as to append 'commission' child object
        return super.getRentalsReport()
                    .map((reportEntry) => {            
                        return this.allocateCommissionsToStakeholders(reportEntry, this._rentalFlowService.findRentalById(reportEntry.id));                        
                    });                    
    }
}
