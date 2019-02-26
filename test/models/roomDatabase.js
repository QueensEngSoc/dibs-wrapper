import assert from 'assert';
import { getFree, getInfo, getInfoByName, getListOfRoomState, getListOfRoomsForUser, getNextValidHalfHour } from "../../models/roomDatabase";

describe('Room Info InterFace Tests', function () {
  describe('Get Free', function () {
    it('Should return array', async () => {
      const out = await getFree(0, 1);
      assert.strictEqual(typeof out, 'object');
    });
  });
  describe('Get Info', function () {
    it('Should return object', async () => {
      const info = await getInfo(1);
      assert.strictEqual(typeof info, 'object');
    });
  });
  describe('Get Info By Name', function () {
    it('Should return object', async () => {
      const roomInfo = await getInfoByName('BMH 111');
      assert('room' in roomInfo);
      assert(roomInfo.room.length > 1);
      assert('roomid' in roomInfo);
    })
  });
  describe('Get List of Room States', function () {
    it('Should return array', async () => {
      const out = await getListOfRoomState(0, 7, '5a6962245468391934e424a1');
      assert.strictEqual(typeof out, 'object');
    });
  })
});
describe('Get List of Users Bookings', () => {
  it('Should return array', async () => {
    const data = await getListOfRoomsForUser('5a6962245468391934e424a1');
    assert.strictEqual(typeof data, 'object');
  });
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
    var time = getNextValidHalfHour(true);

    assert.equal(nextHour + ":30-" + (nextHour + 1) + ":30", time)
  });

  it('should return the next valid half hour', function () {
    var time = getNextValidHalfHour();
    assert.equal(nextHour + ":30", time)
  });
});
