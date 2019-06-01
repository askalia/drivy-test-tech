
require('jasmine');
const fs = require('fs');
const Level5 = require('../level5');
const path = require('path');

describe('Rentals Level5', () => {
    
    let level = null; 
    const REPORT_PATH = path.resolve(__dirname + "/data/output.json");

    beforeAll(() => {
        level = new Level5({ dataPath: path.resolve(__dirname + "/../data/input.json") });
    });

    it('should output a report of rentals', (done) => {
        const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname + '/../data/expected_output.json')));
        const expectedRentals = expected.rentals;

        level.saveReport(REPORT_PATH, 'rentals', _ => {
            const savedReport = JSON.parse(fs.readFileSync(REPORT_PATH));            
            savedReport.rentals.forEach((rental, idx) => {
                const expectedRental = expectedRentals[idx];
                expect(rental.id).toEqual(expectedRental.id);
                expect(rental.options).toEqual(expectedRental.options);
                expect(rental.actions).toEqual(expectedRental.actions);
            })
            done();
        });
    });

    afterAll(() => {
        level = null;
        fs.unlinkSync(REPORT_PATH);
    })

})