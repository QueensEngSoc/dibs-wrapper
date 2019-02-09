const assert = require('chai').assert;
const database = require('../../config/database');

describe('Database URL Test', function() {
    describe('Correct database URL set', function () {
        it('Should return correct URL', function(done) {
            assert.equal(database.accountURL, 'localhost:27017/usrAccountsDatabase');
            done();
        });
    });
});
