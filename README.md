# QBook

QBook is managed and created by the Engineering Society Software Development Team (ESSDEV) for Queen's University. The purpose of its existance is to replace the current ILC room booking software and remedy it's many flaws. Check out the beta found at http://dibs-beta.herokuapp.com/.

## Getting Started

QBook is programmed entirely in Javascript, running Node.js on the backend and standard Javascript on the front end. It utilizes MongoDB for the database. For this app to run correctly, the MongoDB server will need to be running (cmd command: `mongod` in the bin directory of MongoDB; go to https://docs.mongodb.com/tutorials/install-mongodb-on-windows/ to learn more). To initialize and setup the server run the databaseSetup.js, with node.js, found in developer_tools. See a detailed version below.

### Dependancies

This program requires that you have Node.js version X.X or greter and npm version X.X or greater. If you are unsure, make sure you have Node.js and npm installed and in command prompt run: `node -v` for Node version and `npm -v` for npm version.

Numerous Node.js modules are needed for this project. Go to the main directory in command prompt and run `npm install`.

### Running Tests

Automated tests are currently being created. Check the test folder for current progress or check back later. We are using Mocha as our testing framework and Chai as the assertion library.

### Version History

* **1.1.23** - Currently in beta testing, find our beta at http://dibs-beta.herokuapp.com/.

## Authors

* **Michael Albinson**
* **Andrew Farley**
* **Russell Lamey**
* **Alex Ruffo**

See https://github.com/essdev-team/dibs-wrapper/graphs/contributors for a detailed breakdown of contributions.

2018 ESSDEV Dibs Team

## Detailed How-To-Use
<pre>
This project is a simple Node.js wrapper around the Dibs room booking API, with the ability to quickly find free rooms,
display room information and book rooms in a local database.  Currently there is basic support for single hour bookings,
however multi-hour bookings will be added in the future.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              HOW TO USE THIS APP                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// to get this app to work, create a directory somewhere where you want MongoDB to hold the database.
// Open a CMD window, and navigate to the MongoDB/bin folder (Where you installed MongoDB)
// You then have to type the following command within CMD:
//                  mongod --dbpath path\to\where\you\want\your\database
// where path\to\where\you\want\your\database is wherever you want the database to be (I have it in the MongoDB folder
// within the project. You then have to open a new CMD window in the same spot, and type
//                  mongo
//                  use roomDatabase
//
//  You can then run grabJSONS to set up the database, then run the app with app.js.  Navigate to localhost:8000 and it
//  should work!
//
//  To view information in the database, type
//                  db.roomDatabase.find().pretty()
//
//  Also note: if the app crashes for seemingly no reason, or you get a "Cannot set headers after they are sent to
//  the client" error, do the following:
//  in a CMD window within the MongoDB/bin folder, type the following command:
//                  db.roomDatabase.drop()
//
//  if it returns true in the console, it worked!  You then have to re-run the grabJSON.js file, and the
//  app should now work without issues
//                                                                                                
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
</pre>

