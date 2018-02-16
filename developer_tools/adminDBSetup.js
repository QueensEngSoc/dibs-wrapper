var monk = require('monk');
var db = monk('localhost:27017/adminDatabase');
var adminDB = db.get('adminDatabase');
var jsonfile = require('jsonfile');

jsonfile.readFile('adminDBSchema.json', function(err, data) {
    if (err)
        console.log(err);

    for (room of data) {
        var out = room;

        var unix = new Date();
        unix.setFullYear(1971, 10, 3); //November 3rd, 1971 (default date)
        out.disabledEnd = unix;
        out.endSpDate = unix;

        adminDB.insert(out);
    }

    console.log("Insertion Successful");
});


// Code to setup schema from offlineDBSetupFile.json
// ----------------------------------------------------------------------
// jsonfile.readFile('offlineDBSetupFile.json', function(err, obj) {
//     var admin = [];
//     for (room of obj) {
//         var toPush = {
//             BuildingID: room.BuildingID,
//             Name: room.Name,
//             RoomID: room.RoomID,
//             enabled: true,
//             disabledEnd: -1,
//             spHours: {
//                 startTime: -1,
//                 endTime: -1
//             },
//             endSpDate: -1,
//             futureRules: []
//         };
//         admin.push(toPush);
//     }
//
//     jsonfile.writeFile('adminDBSchema.json', admin, function(err) {
//         if (err)
//             console.log(err);
//
//         console.log('JSON creation successful!');
//     });
// });