const fs = require('fs');
const { Rental } = require('../models');
/**
 * this class manages data from a given data-sheet JSON file (rentals, cars, options...)
 */
export class RentalFlowService {

    constructor(filePath = ''){
        this._data = this.retrieveData(filePath);
    }

    retrieveData(filePath){
        if (Array.isArray(this._data)){
            return this._data;
        }
        if (!fs.existsSync(filePath)) {
            throw new Error(`Path ${filePath} does not exist`);
        }
        return JSON.parse(fs.readFileSync(filePath)) || [];
    }

    getRentals(){
        return (this._data.rentals || []).map(rental => Rental.from(rental, this));
    }

    getCars(){
        return this._data.cars || [];
    }

    getRentalOptions(){
        return this._data.options || [];
    }

    findCarById(id) {
        return this.getCars().find(car => car.id === id);
    }

    findRentalById(id) {
        return this.getRentals().find(rental => rental.id === id);
    }
}

RentalFlowService.instance = null;
