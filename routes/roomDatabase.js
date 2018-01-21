var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomDatabase = db.get('roomDatabase');

//All functions return promises, don't know if this is the best way to do this.
//use .then(function(data){}) to get whatever data is needed
/**
 * Ex.
 * getFree(0, 1).then(function(free) {
 *      (use free array)
 * });
 */

/**
 *
 * @param day
 * @param time
 * @returns {promise}
 */
function getSort(day, time) { //gets the list of rooms in the database sorted with currently free first *in progress*
    var out = [];

    var find = new Promise(function(resolve, reject) {
        roomDatabase.find({}, {sort: {Free: 1}}).each(function(data) {
            console.log(data);
        });
    });

    return find;
}

/**
 *
 * @param day
 * @param roomID
 * @returns {promise}
 */
function getFree(day, roomID) { //gets the free array of the roomID on the day given
    var out = [];

    var find = new Promise(function (resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, i) {
            out = data.Free;

            resolve(out);
        });
    });

    return find;
}

/**
 *
 * @param roomID
 * @returns {promise}
 */
function getInfo(roomID) { //gets the info of the selected room (roomID)
    var out = {
        room: "Error",
        size: "Error",
        tv: "Error",
        phone: "Error",
        special: "Error",
        tempImgURL: "",
        roomid: roomID,
    };

    var find = new Promise(function(resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function(data, i) {
            out.room = data.Name;
            out.size = data.Description;
            out.tempImgURL = data.Picture;
            out.tv = data.tv;
            out.phone = data.phone;
            out.special = data.special;
            out.roomid = roomID;

            resolve(out);
        });
    });

    return find;
}

/**
 *
 * @param day
 * @returns {promise}
 */
function getAllFree(day) { //gets every free array on a certain day
    var out = [];

    var find = new Promise(function(resolve, reject) {
        roomDatabase.find({}, function(e, data) {
            for (var i = 0; i < data.length; i++) {
                out.push({
                    roomID: data[i].RoomID,
                    Free: data[i].Free
                });
            }

            resolve(out);
        });
    });

    return find;
}

/**
 *
 * @param day
 * @param time
 * @param roomID
 * @returns {promise}
 */
function getTimeFree(day, time, roomID) { //returns whether or not a room is booked at a certain time and day
    var out = false;

    var find = new Promise(function(resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function(data, i) {
            resolve(data.Free[time].free);
        });
    });

    return find;
}

function getListOfRoomState(day, time) { //returns whether or not a room is booked at a certain time and day, for each room  (useful for map / home page)
    var out = false;
    // var listFree = {
    //     room: 0,
    //     isFree: false,
    // };
    var listFree = [];

    var find = new Promise(function(resolve, reject) {
        roomDatabase.find({}).each(function(data, i) {
            var roomNum = data.Name.match(/\d+/)[0] // get the number from the room
            var mapRoomName = "bmh" + roomNum;

            listFree.push({
                room: data.Name,
                roomNum: mapRoomName,
                isFree: data.Free[time - 7].free
            })
        });
        resolve();
    });

    return listFree;
}


module.exports = {
    getSort: getSort,
    getFree: getFree,
    getInfo: getInfo,
    getAllFree: getAllFree,
    getTimeFree: getTimeFree,
    getListOfRoomState: getListOfRoomState
};