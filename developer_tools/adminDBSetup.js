var monk = require('monk');

var env = process.env.NODE_ENV || 'dev';
if (env == 'dev')
    var db = monk('localhost:27017/adminDatabase');
else
    var db = monk('mongodb://heroku_hh23n177:mkhup337tbpb35q85m5c066jla@ds035607.mlab.com:35607/heroku_hh23n177');

var adminDB = db.get('adminDatabase');

const json = require('./adminDBSchema.json');
for (const room of json) {
    var out = room;

    var unix = new Date();
    unix.setFullYear(1971, 10, 3); //November 3rd, 1971 (default date)
    out.disabledEnd = unix;
    out.endSpDate = unix;

    adminDB.insert(out);
}

console.log("Database Generation Successful");
process.exit(0);

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
