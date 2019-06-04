
export class Report {
    
    constructor(){
        this._collection = [];
    }
    findEntryById(id) {
        return this._collection.find(entry => entry.id === id);
    }

    addEntry(entry){
        this._collection.push(entry);
    }

    getReport(){
        return this._collection;
    }
}
