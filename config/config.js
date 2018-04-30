const room_booking_limit = 4;
const room_hour_limit = 12;
const per_room_limit = 5;
const userVersion = 3;
const fromEmail = "no-reply@engsoc.queensu.ca";
const dibsVersion = "1.1.23";
// const hostName = "localhost:8080"
const newFeatures =
    '<p>Improvements Included in Version 1.1.23 (3/26/2018):  General system stability improvements to enhance the user\'s experience</p>\n' +
    '<p>Improvements Included in Version 1.1.21 (3/20/2018):  General system stability improvements to enhance the user\'s experience, including: </p>' +
    // '<ul><li>Fixed a bug allowing inventive users to book rooms in the past</li>\n' +
    // '    <li>Fixed a bunch of small UI issues</li>\n' +
    // '    <li>Updated user account functions with a new theme picker!</li>\n' +
    // '</ul>\n' +
    '</p>';

module.exports = {
    room_booking_limit: room_booking_limit,
    room_hour_limit: room_hour_limit,
    userVersion: userVersion,
    fromEmail: fromEmail,
    dibsVersion: dibsVersion,
    newFeatures: newFeatures,
    per_room_limit:per_room_limit
};
