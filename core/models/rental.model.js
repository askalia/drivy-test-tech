import { RentalFlowService } from '../services';

const moment = require('moment');
moment.suppressDeprecationWarnings = true;

export class Rental {
 
    constructor(){
        this.id;
        this.car_id;
        this.start_date;
        this.end_date;
        this.distance;
        this._rentalFlowService = RentalFlowService.getInstance();
    }

    static from(data){
        return Object.entries(data).reduce((rental, [prop, value]) => {
            rental[prop] = value;            
            return rental;
        }, new Rental());
    }

    get duration() {
        return (
          moment(this.end_date)
            .endOf("day")
            .diff(moment(this.start_date).startOf("day"), "days") + 1
        );
    }

    get options(){
        return (this._rentalFlowService.getRentalOptions())
                .filter(option => option.rental_id === this.id)
                .map(option => option.type);            
    }

    
}