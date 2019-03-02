import * as assert from 'assert';
import { getDaysFromToday } from '../../src/lib/dateFuncs';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('Get Days From Today', () => {

  beforeEach(() => {
    sandbox.useFakeTimers({
      toFake: ['setTimeout']
    });
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('returns the correct diff between two dates within the same calendar day', () => {
    const timeToFake = new Date();
    timeToFake.setHours(13, 12, 2);
    sinon.useFakeTimers(timeToFake);

    const dayToSend = new Date();
    dayToSend.setHours(12, 29,49);
    const result = getDaysFromToday(dayToSend);
    assert.strictEqual(result, 0, `Expected to see that the difference is days, but got ${result} days instead`);
  });

  it('returns the correct diff between two dates within the same calendar day, even if the passed in date is later than the "current time"', () => {
    const timeToFake = new Date();
    timeToFake.setHours(13, 12, 2);
    sinon.useFakeTimers(timeToFake);

    const dayToSend = new Date();
    dayToSend.setHours(23, 58,49);
    const result = getDaysFromToday(dayToSend);
    assert.strictEqual(result, 0, `Expected to see that the difference is 0 days, but got ${result} days instead`);
  });

  it('returns the correct diff between two dates across different calendar days', () => {
    const timeToFake = new Date();
    timeToFake.setHours(13, 12, 2);
    sinon.useFakeTimers(timeToFake);

    const dayToSend = new Date();
    dayToSend.setDate(dayToSend.getDate() + 3);
    const result = getDaysFromToday(dayToSend);
    assert.strictEqual(result, 3, `Expected to see that the difference is 3 days, but got ${result} days instead`);
  });

  it('returns the correct negative diff between two dates across different calendar days', () => {
    const timeToFake = new Date();
    timeToFake.setHours(13, 12, 2);
    sinon.useFakeTimers(timeToFake);

    const dayToSend = new Date();
    dayToSend.setDate(dayToSend.getDate() - 3);
    const result = getDaysFromToday(dayToSend);
    assert.strictEqual(result, -3, `Expected to see that the difference is -3 days, but got ${result} days instead`);
  });

  it('returns the correct diff between two dates across different calendar days, even if they are less than 24 hours apart', () => {
    const timeToFake = new Date();
    timeToFake.setHours(23, 59, 2);
    sinon.useFakeTimers(timeToFake);

    const dayToSend = new Date();
    dayToSend.setDate(dayToSend.getDate() + 1);
    dayToSend.setHours(0,10,0,0);
    const result = getDaysFromToday(dayToSend);
    assert.strictEqual(result, 1, `Expected to see that the difference is 1 day, but got ${result} days instead`);
  });

});
