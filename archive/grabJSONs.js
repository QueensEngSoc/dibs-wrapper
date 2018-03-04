//code to grab JSONs from dibs API and insert into MongoDB (not anymore, thanks Alex)
var isAlexDesktop = false;   // set to false if this is not my desktop
var isAlexLaptop = false;   // set to false if this is not my surface
var isDebug = true;        // set this to true if you are running the debugger on any other file, else this will stop
// running when you click debug!!

var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomDatabase');

//--------------------------------------------------------------------------------------------------------------------//
// This section is a fancy bit of code to automagically™ start mongo, navigate to and set up the database path to the
// one on my desktop, and then switch to the right database collection, and start the process
//--------------------------------------------------------------------------------------------------------------------//

if (require.main.filename.toString().indexOf("D:\\Development\\Queens\\ESSDEV\\DibsMain") >= 0)
    isAlexDesktop = true;
else if (require.main.filename.toString().indexOf("D:\\OneDrive\\Development\\Queens\\ESSDEV\\DibsMain\\MongoDB") >= 0)
    isAlexLaptop = true;

if (!isDebug && (isAlexDesktop || isAlexLaptop)) {

    //spawn the first process containing the mongod.exe process
    var spawn = require('child_process').spawn,
        cp = spawn('cmd.exe', ['/K']);

    // spawn the second command window for the interactive Mongo terminal
    var spawn2 = require('child_process').spawn,
        mongo = spawn2('cmd.exe', ['/K']);

    // after 1 second has passed, assume the CMD window is up and ready, and set the listener to redirect stdout to the
    // console, and write the commands to stdin to start the mongod process
    setTimeout(function () { // after 1 sec
        // remove prev stdout listener
        cp.stdout.removeAllListeners('data');
        // new stdout listener
        cp.stdout.on('data', function (data) {
            console.log('mongod: ' + data);
        });

        // give input
        if (isAlexDesktop) {
            cp.stdin.write("H: \n");
            cp.stdin.write("cd H:\\Programs\\MongoDB\\bin \n");
            cp.stdin.write("mongod --dbpath D:\\Development\\Queens\\ESSDEV\\DibsMain\\MongoDB \n");
        }
        else if (isAlexLaptop) {
            cp.stdin.write("C: \n");
            cp.stdin.write("cd C:\\Program Files\\MongoDB\\Server\\3.6\\bin \n");
            cp.stdin.write("mongod --dbpath D:\\OneDrive\\Development\\Queens\\ESSDEV\\DibsMain\\MongoDB \n");
        }

    }, 1000);

    // after 1.6 seconds have passed, assume that mongod is ready in the other CMD window, set the listener to redirect
    // stdout to the console, and write the commands to stdin to start the mongo terminal process.
    // **NOTE** This is a bit iffy, as if the mongod process does not finish setup before mongo starts, it will crash
    //          Also note that this sometimes fails to switch databases to the right one, so check the terminal window
    //          if it appears to not be working properly.
    //
    // 1.6 seconds after the switched to db roomdatabase (or the switch command, since the output is sketch) is seen
    // in the output window, the getAPIInfo function will be called to populate the database.
    setTimeout(function () { // after 1 sec
        // remove prev stdout listener
        mongo.stdout.removeAllListeners('data');
        // new stdout listener
        mongo.stdout.on('data', function (data) {
            console.log('mongo: ' + data);
            if (data.toString().indexOf("switched to db roomDatabase") >= 0 || data.toString().indexOf("use roomDatabase") >= 0)
                setTimeout(function () { // after 1 sec
                    getAPIInfo();
                }, 1);
        });

        console.log(("MONGO IS NEXT: -------------------------------------------------------"));
        if (isAlexDesktop) {
            mongo.stdin.write("H: \n");
            mongo.stdin.write("cd H:\\Programs\\MongoDB\\bin \n");
        }
        else if (isAlexLaptop) {
            mongo.stdin.write("C: \n");
            mongo.stdin.write("cd C:\\Program Files\\MongoDB\\Server\\3.6\\bin \n");
        }

        mongo.stdin.write("mongo terminal \n");
        mongo.stdin.write("use roomDatabase \n");

    }, 1600);


}
else {
     getAPIInfo();
}

//--------------------------------------------------------------------------------------------------------------------//
//                                      END OF AUTOMAGIC™ COOL SECTION                                                //
//--------------------------------------------------------------------------------------------------------------------//

function getAPIInfo() {
    var request = require('request');
    var fs = require('fs'); // file system calls, in order to see if we have a local copy of the photo on the server
    var str = "https://queensu.evanced.info/dibsAPI/rooms";

    request(str, function (err, res, body) {
            for (var json in JSON.parse(body)) {
                var data = JSON.parse(body)[json];
                if (data.Name.indexOf("BMH 111") >= 0)
                    data.Name = "BMH 111";

                var description = data.Description;
                if (description.indexOf("TV") > 0 || description.indexOf("Projector") > 0)
                    data.tv = true;
                else
                    data.tv = false;

                if (description.indexOf("Small") >= 0 || description.indexOf("small") >= 0)
                    data.size = 0;  // set 0 as small
                else if (description.indexOf("Medium") >= 0)
                    data.size = 1;    // set 1 as medium
                else if (description.indexOf("Large") >= 0)
                    data.size = 2;  // set 2 as large
                else {
                    data.size = 3; // this is room 111, or the "other" type room
                    data.special = true;
                }

                var roomNum = data.Name.match(/\d+/)[0]; // get the number from the room
                var roomPicName = "BMH" + roomNum + ".jpg";
                if (fs.existsSync("../public/img/" + roomPicName)) {
                    data.Picture = "img/" + roomPicName;
                }

                if (description.indexOf("phone") >= 0 || description.indexOf("Phone") >= 0)
                    data.phone = true;

                data.Free = createArray(16, true);

                roomInfo.insert(data);
                console.log(data);
            }
        }

    );

}

function createArray(len, val) {
    var out = new Array(len);
    for (var i = 0; i < len; i++) {
        out[i] = {
            free: val,
            time: ((7 + i) >= 10 ? (7 + i) : "0" + (7 + i)) + ":30 - " + ((8 + i) >= 10 ? (8 + i) : "0" + (8 + i)) + ":30",
            startTime: 7 + i,
            owner: 0,
            bookingHash: ""
        };
    }
    return out;
}



