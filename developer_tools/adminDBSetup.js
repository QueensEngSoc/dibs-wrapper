// To run this helper file, add this to the "Node Parameters" option in Webstorm (or run with these params from the command line)
// ` -r @babel/register `

const monk = require('monk');

const env = process.env.NODE_ENV || 'dev';
if (env == 'dev')
    var db = monk('localhost:27017/adminDatabase');
else
    var db = monk('mongodb://heroku_hh23n177:mkhup337tbpb35q85m5c066jla@ds035607.mlab.com:35607/heroku_hh23n177');

const adminDB = db.get('adminDatabase');

const json = require('./adminDBSchema.json');
setupAdminDB(); // need this so we can await the "insert" command (as that is async :)

async function setupAdminDB() {
    for (const room of json) {
        const tempRoom = room;

        const unix = new Date();
        unix.setFullYear(1971, 10, 3); //November 3rd, 1971 (default date)
        tempRoom.disabledEnd = unix;
        tempRoom.endSpDate = unix;

        await adminDB.insert(tempRoom);
    }

    console.log("Database Generation Successful");
    process.exit(0);
}

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
