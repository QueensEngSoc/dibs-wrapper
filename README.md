# QBook

QBook is managed and created by the Engineering Society Software Development Team (ESSDEV) for Queen's University. The purpose of its existence is to replace the current ILC room booking software and remedy it's many flaws. Check out the beta found at http://dibs-beta.herokuapp.com/.

## Getting Started

QBook is programmed entirely in Javascript, running Node.js on the backend and standard Javascript on the front end. It utilizes MongoDB for the database and Handlebars to create pages. For this app to run correctly, the MongoDB server will need to be running (cmd command: `mongod` in the bin directory of MongoDB; go to https://docs.mongodb.com/tutorials/install-mongodb-on-windows/ to learn more). To initialize and setup the server run the databaseSetup.js, with node.js, found in developer_tools. See a detailed version below or in the developer_tools README. **Make sure you are connected to the internet!**

### Dependencies

This program requires that you have Node.js version 8.10.0 or greater and npm version 5.6.0 or greater. If you are unsure, make sure you have Node.js and npm installed and in command prompt run: `node -v` for Node version and `npm -v` for npm version.

Numerous Node.js modules are needed for this project. Go to the main directory in command prompt and run `npm install`.
Check the dependencies object in package.json.

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
