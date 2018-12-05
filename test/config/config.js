var assert = require('chai').assert;
var config = require('../../config/config');

describe('Config JS Constants Test', function () {
    describe('Room Booking Limit', function () {
        it('Should be 4', function (done) {
            assert.equal(config.room_booking_limit, 4);
            done();
        });
    });
    describe('Room Hour Limit', function () {
        it('Should be 12', function (done) {
            assert.equal(config.room_hour_limit, 12);
            done();
        });
    });
});
