const fs = require('fs');
const path = require('path');
const { RentalFlowService } = require('./services');
const { Report, ReportEntry } = require('./models');

export class Level {

    constructor (options = { dataPath: '' }) {
        this._rentalFlowService = new RentalFlowService(options.dataPath);
        this._report = new Report();
        this._options = options;        
    }
    
    computePrice(rental, car) {
        throw new Error('computePrice(): This method must be overriden');
    }

    getRentalsReport() {
        const lev = 'Level2';
        this._rentalFlowService.getRentals().forEach((rental) => {
            const car = this._rentalFlowService.findCarById(rental.car_id);
            let reportEntry = this._report.findEntryById(rental.id);
            if (car !== undefined) {
                if (reportEntry === undefined) {
                    reportEntry = ReportEntry.from(rental.id, 0);
                    this._report.addEntry(reportEntry);                    
                }        
                reportEntry.price += this.computePrice(rental, car);                                
            }
        });
        
        return this._report.getReport();
    }

    saveReport(outputFilePath, realm = null, callback = null) {
        const reportData = realm === null ? this.getRentalsReport() : { [realm] : this.getRentalsReport() };
        const folderPath = path.parse(outputFilePath).dir; 
        !fs.existsSync(folderPath) && fs.mkdirSync(folderPath);
        fs.writeFileSync(
            path.normalize(outputFilePath),
            JSON.stringify(reportData, null, 4)                        
        );
        typeof callback === 'function' && callback({ message: `File written in ${outputFilePath}` });
        
    }
}
