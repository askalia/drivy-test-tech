const moment = require('moment');
moment.suppressDeprecationWarnings = true;
const fs = require('fs');
const { normalize } = require('path');

class Level {

    constructor (options = { dataPath: '' }) {
        this._data = [];
        this._report = [];
        this._options = options;
        this.retrieveData(this._options.dataPath);

    }
    retrieveData(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Path ${filePath} does not exist`);
        }
        this._data = JSON.parse(require('fs').readFileSync(filePath))
    }

    getRentals() {
        return this._data.rentals || [];
    }
    getCars() {
        return this._data.cars || [];
    }

    computePrice(rental, car) {
        const operations = [
            function computeTimeAspect(rental) {
                const countRentalDuration = () => moment(rental.end_date).endOf("day").diff(moment(rental.start_date).startOf("day"), 'days') + 1;
                return countRentalDuration() * car.price_per_day
            },
            function computeDistanceAspect(rental, car) { return rental.distance * car.price_per_km }
        ];
        return operations.reduce((totalPrice, op) => {
            totalPrice += op(rental, car);
            return totalPrice;
        }, 0);

    }

    findCarById(id) {
        return this.getCars().find(car => car.id === id);
    }

    createReportEntry(id, price) {
        return { id, price };
    }

    findReportEntry(id) {
        return this._report.find(entry => entry.id === id);
    }

    getRentalsReport() {
        this.getRentals().forEach((rental) => {
            const car = this.findCarById(rental.car_id);
            let reportEntry = this.findReportEntry(rental.id);
            if (car !== undefined) {
                if (reportEntry === undefined) {
                    reportEntry = this.createReportEntry(rental.id, 0);
                    this._report = [
                        ...this._report,
                        reportEntry
                    ]
                }
                reportEntry.price += this.computePrice(rental, car);
            }
        });
        return this._report;
    }
    saveReport(outputFilePath) {
        fs.writeFile(
            normalize(outputFilePath),
            JSON.stringify(this.getRentalsReport(), null, 4),
            () => console.log(`File written in ${outputFilePath}`)
        );
    }
}

module.exports = Level;