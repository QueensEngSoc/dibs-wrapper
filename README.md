# dibs-wrapper

Basic info on MongoDB
______________________________________________________________________________________________________________________________
To get the MongoDB to work, open a CMD window, and navigate to where you intalled MongoDB.  Navigate to the ```\bin``` folder. Then type ```mongod --dbpath "Path_TO_YOUR_PROJECT's_MongoDB_Folder"``` to set the path of the database to the correct one.  Mongo should start on localhost port 27017, or whatever you may have changed it to, if you provided the right path.  You may open annother command prompt window within the MongoDB\bin folder, and type mongo to view the read and write requests to the db.

To insert new information to the database, you can use the Mongo console, using the ```db.Collection_Name.insert({'key' : 'value', 'key2' : 'value2'})``` syntax.  This is similar to JSON, allowing you to import a JSON response into the database without having to edit it. 

For an easy tutorial on using MongoDB with node, go here: https://closebrace.com/tutorials/2017-03-02/creating-a-simple-restful-web-app-with-nodejs-express-and-mongodb

-Alex
