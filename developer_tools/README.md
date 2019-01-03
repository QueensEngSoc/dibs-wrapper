# Developer Tools

The files and schemas contained in this folder were used to create the app and are used to setup the app for anyone wishing to run a local copy.
Works on Linux, Mac OSX and Windows.

## Setting Up The Database

Windows Instructions:

QBook uses MongoDB as a database. To run this app locally you will need MongoDB installed. More information can be found in the getting started section of the parent README.

### Step 1
With MongoDB installed, you will need to run the server with the command `mongod` from the bin directory of MongoDB (usually something like C:\Program Files\MongoDB\Server\3.6\bin) if on Windows, or from anywhere if on Linux or OSX.
With the server running, open another command prompt window in the same directory and enter `mongo`. This will let you directly access the server.
In this console, run `use roomDatabase`. Now you are setup and ready to initialize the database.

### Step 2
Back in the developer_tools folder of the project, in command prompt run `node createOfflineDB` to setup the database.
Wait till the process says it is done and then you should be able to close the window.
Congratulations, your database should be setup and you can run app.js in the root directory of the project to run the app.

These steps are for setting up the room database. To setup the admin database locally, do the same steps but replace "roomDatabase" (from step 1) with "adminDatabase" and run `node adminDBSetup` in step 2 instead.

## Resetting The Database
To reset any database, simply drop the collection by running `database`.`collection`.drop() in the mongo console (where `database` is the database you are targetting and `collection` is the collection you want to drop, run show collections to see them) and do step 2 from the setting up the database section.

## Removing and Modifying Bookings
To clear a single day of bookings for a specific room without nuking the entire DB, run clearData.js in node and follow the prompts.  Please note however that this wizard is still in beta, and while it *should* work, it may fail within some edge cases.  This will irreversibly clear the data for that day, for that room from the DB, so tread lightly!
Tools to remove individual bookings, or remove larger blocks of bookings are planed for a future release.

## Troubleshooting
Most problems with the app can be fixed by resetting the database (as explained above). If a reset does not fix this try restarting the app.
