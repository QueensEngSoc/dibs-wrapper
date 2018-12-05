var assert = require('chai').assert;
var roomBook = require('../../models/roomBooking');
var server = require('express')();

var req = { //a nice little replica of req so no calls need to be made for route requests
  isAuthenticated: function () {
    return true;
  }
};

describe('Room Booking Interface Test', function () {
  describe('Book Room', function () {
    it('Should return object', function (done) {
      roomBook.bookRoom(0, 7, 1, 1, '5a6962245468391934e424a1', req).then(function (out) {
        assert.typeOf(out, 'object');
        done();
      });
    });
  });
  describe('Unbook Room', function () {
    it('Should return object', async () => {
      const out = await roomBook.unbookRoom(0, 7, 1, 1, '5a6962245468391934e424a1', req);
      assert.typeOf(out, 'object');
    });
  });
  describe('Unbook All For User', function () {
    it('Should return object', async () => {
      const out = await roomBook.unbookRoom(0, 7, 1, 1, '5a6962245468391934e424a1', req);
      assert.typeOf(out, 'object');
    });
  });
  describe('Unbook All For Room', function () {
    it('Should return object', function (done) {
      roomBook.unbookAllForRoom(0, 1).then(function (out) {
        assert.typeOf(out, 'object');
        done();
      });
    });
  });
});
