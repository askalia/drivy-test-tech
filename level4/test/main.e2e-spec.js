
require('jasmine');
const fs = require('fs');
const Level4 = require('../level4');
const path = require('path');
const rimraf = require('rimraf');

describe('Rentals Level4', () => {
    
    let level = null; 
    const REPORT_PATH = path.resolve(__dirname + "/data/output.json");

    beforeAll(() => {
        level = new Level4({ dataPath: path.resolve(__dirname + "/../data/input.json") });
    });

    it('should output a report of rentals', (done) => {
        const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../data/expected_output.json')));
        const expectedRentals = expected.rentals;
        level.saveReport(REPORT_PATH, 'rentals');

        const savedReport = JSON.parse(fs.readFileSync(REPORT_PATH));            
        savedReport.rentals.forEach((rental, idx) => {
            const expectedRental = expectedRentals[idx];
            expect(rental.id).toEqual(expectedRental.id),
            expect(rental.actions).toEqual(expectedRental.actions);
        })
        done();
    });

    afterAll(() => {
        level = null;
        rimraf.sync(path.parse(REPORT_PATH).dir);    
    })

})