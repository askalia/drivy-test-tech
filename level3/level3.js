const { ReportEntry } = require('../core/models');
const { Level2 } = require("../level2/level2");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;
const percent = require("percent-value");

export class Level3 extends Level2 {
  
    constructor(options){
        super(options);
        this._dispatchingRules = this.loadDispatchingRules()
    }
    
    loadDispatchingRules(){
        return require('./lib/dispatching-rules').default;
    }

    getDispatchingRules(key = null){
        if (key !== null && ! (key in this._dispatchingRules)){
            throw new Error(`Rule '${key}' doest not exist`);
        }
        return key !== null ? this._dispatchingRules[key] : this._dispatchingRules;
    }

    appendCommissioningToReportEntry(reportEntry, rental){
        const _getBaseCommissionOnRevenue = (reportEntry) => {
            const FEE_COMMISSION = 30;
            return percent(FEE_COMMISSION).from(reportEntry.price);
        }

        const _dispatchCommissionToStakeHolders = (baseCommission) => {
            let commissionStruct = {};
            Object
                .entries(this.getDispatchingRules())
                .reduce((overallCommission, [stakeHolder, gainRule]) => {
                    commissionStruct[stakeHolder] = (typeof gainRule === 'function' && gainRule(overallCommission, rental.duration)) || 0;
                    // Below, we could alternatively consider that gainRule is also responsible for subtracting the calculated gain from overallCommission
                    overallCommission -= commissionStruct[stakeHolder];
                    return overallCommission;
                }, baseCommission);
            
            return commissionStruct;
        }
        ReportEntry.withCommission(reportEntry).commission = _dispatchCommissionToStakeHolders(_getBaseCommissionOnRevenue(reportEntry));
        return reportEntry;
    }

    getRentalsReport() {
        // we get and override the report so as to append 'commission' child object
        return super.getRentalsReport()
        .map((reportEntry) => {
            return this.appendCommissioningToReportEntry(reportEntry, this._rentalFlowService.findRentalById(reportEntry.id))
        });        
    }
}
