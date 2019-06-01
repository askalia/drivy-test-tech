const Level2 = require("../level2/level2");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;
const percent = require("percent-value");

class Level3 extends Level2 {
  
    constructor(options){
        super(options);
        this._dispatchingRules = {
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
                    commissionStruct[stakeHolder] = (typeof gainRule === 'function' && gainRule(overallCommission, this.getRentalDuration(rental))) || 0;
                    // Below, we could alternatively consider that gainRule is also responsible for subtracting the calculated gain from overallCommission
                    overallCommission -= commissionStruct[stakeHolder];
                    return overallCommission;
                }, baseCommission);
            
            return commissionStruct;
        }
        reportEntry.commission = _dispatchCommissionToStakeHolders(_getBaseCommissionOnRevenue(reportEntry));
        return reportEntry;
    }

    getRentalsReport() {
        // we get and override the report so as to append 'commission' child object
        return super.getRentalsReport()
        .map((reportEntry) => {
            return this.appendCommissioningToReportEntry(reportEntry, this.findRentalById(reportEntry.id))
        });        
    }
}

module.exports = Level3;