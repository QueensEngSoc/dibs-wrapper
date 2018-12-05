var assert = require('chai').assert;
var roomInfo = require('../../models/roomDatabase');

describe('Room Info InterFace Tests', function () {
  describe('Get Free', function () {
    it('Should return array', async () => {
      const out = await roomInfo.getFree(0, 1);
      assert.typeOf(out, 'array');
    });
  });
  describe('Get Info', function () {
    it('Should return object', function (done) {
      roomInfo.getInfo(1).then(function (out) {
        assert.typeOf(out, 'object');
        done();
      });
    });
  });
  describe('Get Info By Name', function () {
    it('Should return object', function (done) {
      roomInfo.getInfoByName('BMH 111').then(function (out) {
        assert.typeOf(out, 'object');
        done();
      });
    })
  });
  describe('Get List of Room States', function () {
    it('Should return array', async () => {
      const out = await roomInfo.getListOfRoomState(0, 7, '5a6962245468391934e424a1');
      assert.typeOf(out, 'array');
    });
  })
});
describe('Get List of Users Bookings', function () {
  it('Should return array', function (done) {
    roomInfo.getListOfRoomsForUser('5a6962245468391934e424a1').then(function (out) {
      assert.typeOf(out, 'array');
      done();
    });
  })
});

describe('Get the next valid hour', function () {
  var nextHour;
  before(function () {
    var d = new Date();
    nextHour = d.getHours();
    var nextMin = d.getMinutes();
    if (nextMin > 30)
      nextHour++;

    if (nextHour > 23 || nextHour < 7)
      nextHour = 7;
  });

  it('should return the next valid hour formatted to the DB\'s time representation', function () {
    var time = roomInfo.getNextValidHalfHour(true);

    assert.equal(nextHour + ":30-" + (nextHour + 1) + ":30", time)
  });

  it('should return the next valid half hour', function () {
    var time = roomInfo.getNextValidHalfHour();
    assert.equal(nextHour + ":30", time)
  });
});
