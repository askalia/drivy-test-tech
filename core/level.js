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
        throw new Error('computePrice(): This method must be overriden');
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

    findRentalById(id) {
        return this.getRentals().find(rental => rental.id === id);
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
                    ];
                }
                reportEntry.price += this.computePrice(rental, car);
            }
        });
        return this._report;
    }

    saveReport(outputFilePath, realm = null, callback = null) {
        const reportData = realm === null ? this.getRentalsReport() : { [realm] : this.getRentalsReport() };
        fs.writeFile(
            normalize(outputFilePath),
            JSON.stringify(reportData, null, 4),
            () => {
                typeof callback === 'function' && callback({ message: `File written in ${outputFilePath}` });
            }
        );
    }
}

module.exports = Level;