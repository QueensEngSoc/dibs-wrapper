var assert = require('chai').assert;
var database = require('../../models/userFunctions');

describe('Database URL Test', function() {
    describe('Correct database URL set', function () {
        it('Should return correct URL', function(done) {
            assert.equal(database.accountURL, 'localhost:27017/usrAccountsDatabase');
            done();
        });
    });
});