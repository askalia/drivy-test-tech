

export class ReportEntry {

    constructor(id = 0, price = 0, actions = []){
        this.id = id;    
        this.price = price;
        this._actions = actions;
    }

    findActionByWho(actions){
        return (who) => actions.find(action => action.who === who)
    }

    static from(id, price){
        return new ReportEntry(id, price);
    }

    set actions(actions) {
        this._actions = [
            ...this.actions,
            ...actions
        ];
    }
    get actions(){
        return this._actions;
    }
}
