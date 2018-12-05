var assert = require('assert');
var database = require('../../models/userFunctions');

describe('Database URL Test', function () {
  describe('Correct database URL set', function () {
    it('Should return correct URL', () => {
      console.log(database)
      assert.strictEqual(database.accountURL, 'localhost:27017/usrAccountsDatabase');
    });
  });
});
