const { ReportEntry } = require('../core/models');
const percent = require('percent-value');
const { Level3 } = require('../level3/level3');

export class Level4 extends Level3 {

    constructor(options){
        super(options);
        const { rules, rates } = this._loadActionsRulesAndRates();
        this._actionsRules = rules;
        this._actionsRulesRates = rates;
    }

    _loadActionsRulesAndRates(){
        return require('./lib/actions-rules.lib');
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
