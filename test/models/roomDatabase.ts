import assert from 'assert';
import sinon from 'sinon';
import monk from 'monk';

import { getNextValidHalfHour } from '../../models/roomDatabase';

import * as roomDatabaseFuncs from '../../src/lib/roomDatabase';
import * as adminDbFuncts from '../../models/adminDatabase';

import { roomObject } from '../fixtures/roomResponse';

const sandbox = sinon.createSandbox();

describe('Room Database Functions', () => {
  beforeEach(async () => {
    sandbox.stub(adminDbFuncts, 'getDisabledRoomIDs').returns([])
  });

  afterEach(sandbox.restore);

  describe('Get the next valid hour', function () {
    let nextHour;
    before(function () {
      const d = new Date();
      nextHour = d.getHours();
      const nextMin = d.getMinutes();
      if (nextMin > 30)
        nextHour++;

      if (nextHour > 23 || nextHour < 7)
        nextHour = 7;
    });

    it('should return the next valid hour formatted to the DB\'s time representation', function () {
      const time = getNextValidHalfHour(true);
      assert.strictEqual(nextHour + ':30-' + (nextHour + 1) + ':30', time)
    });

    it('should return the next valid half hour', function () {
      const time = getNextValidHalfHour();
      assert.strictEqual(nextHour + ':30', time)
    });
  });

  describe('getFreeTableWithUserData', () => {
    it('Returns the given free table if the userid is null', async () => {
      sandbox.stub(monk, 'default').returns({
        get: sandbox.stub().returns({
          find: sandbox.stub().resolves(roomObject)
        })
      });

      const freeTable = await roomDatabaseFuncs.getFreeTableWithUserData('ROOM 1', -1, 'ABC');
      assert.strictEqual(freeTable.length, roomObject.Free.length);
      assert.strictEqual(freeTable, roomObject.Free);
    });
  });
});
