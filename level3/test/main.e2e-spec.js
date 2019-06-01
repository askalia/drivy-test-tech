
require('jasmine');
const fs = require('fs');
const Level3 = require('../level3');
const path = require('path');

describe('Rentals Level3', () => {
    
    let level = null; 
    const REPORT_PATH = path.resolve(__dirname + "/data/output.json");

    beforeAll(() => {
        level = new Level3({ dataPath: path.resolve(__dirname + "/../data/input.json") });
    });

    it('should output a report of rentals', (done) => {
        const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../data/expected_output.json')));
        const expectedRentals = expected.rentals;

        level.saveReport(REPORT_PATH, 'rentals', _ => {
            const savedReport = JSON.parse(fs.readFileSync(REPORT_PATH));            
            savedReport.rentals.forEach((rental, idx) => {
                const expectedRental = expectedRentals[idx];
                expect(rental.id).toEqual(expectedRental.id),
                expect(rental.price).toEqual(expectedRental.price);
                expect(rental.commission).toEqual(expectedRental.commission);
            })
            done();
        });
    });

    afterAll(() => {
        level = null;
        fs.unlinkSync(REPORT_PATH);
    })

})