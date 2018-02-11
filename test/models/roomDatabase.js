var assert = require('chai').assert;
var roomInfo = require('../../models/roomDatabase');

describe('Room Info InterFace Tests', function() {
    describe('Get Free', function () {
        it('Should return array', function (done) {
            roomInfo.getFree(0, 1).then(function (out) {
                assert.typeOf(out, 'array');
                done();
            });
        });
    });
    describe('Get Info', function() {
        it('Should return object', function (done) {
            roomInfo.getInfo(1).then(function (out) {
                assert.typeOf(out, 'object');
                done();
            });
        });
    });
    describe('Get Info By Name', function() {
        it('Should return object', function(done) {
            roomInfo.getInfoByName('BMH 111').then(function(out) {
                assert.typeOf(out, 'object');
                done();
            });
        })
    });
    describe('Get List of Room States', function() {
        it('Should return array', function(done) {
            roomInfo.getListOfRoomState(0, 7, '5a6962245468391934e424a1').then(function(out) {
                assert.typeOf(out, 'array');
                done();
            });
        })
    });
    describe('Get List of Users Bookings', function() {
        it('Should return array', function(done) {
            roomInfo.getListOfRoomsForUser('5a6962245468391934e424a1').then(function(out) {
                assert.typeOf(out, 'array');
                done();
            });
        })
    });
});