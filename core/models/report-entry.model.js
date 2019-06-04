
export class ReportEntry {

    constructor(id = 0, price = 0){
        this.id = id;    
        this.price = price;
    }

    findActionByWho(who){
        return this.actions.find(action => action.who === who)
    }

    static withCommission(reportEntry){
        addProperty(reportEntry, 'commission', {});
        return reportEntry;
    }

    static withActions(reportEntry){
        addProperty(reportEntry, 'actions', [])        
        return reportEntry;
    }

    static withOptions(reportEntry){
        addProperty(reportEntry, 'options', []);
        return reportEntry;
    }

    static from(id, price){
        return new ReportEntry(id, price);
    }    
}

function addProperty(obj, propName, defaultValue) {
    return Object.defineProperty(obj, propName, {
        value: defaultValue,
        writable: true,
        enumerable: true
      });
      
}