const $ = require('najax');

function checkReservation(firstName, lastName, phoneNumber, emailAddress, roomID, dateTime, resLength) {
    var dibsWSURL = 'https://queensu.evanced.info/admin/dibs/api/reservations/post';
    var reservationSent = false;
    if (!reservationSent) {
        reservationSent = true;

        var postData = {
            firstName: firstName,
            lastName: lastName,
            roomid: roomID,
            startDate: dateTime,
            reservationLength: resLength,
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
            langCode: "en-US",
            staffAccess: false
        };

        $.post({
            url: dibsWSURL,
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            async: true,
            success: function(objReturn) {
                if (objReturn.IsSuccess === true) {
                    console.log('Submitted!');
                } else {
                    console.log('Booking Success: ' + objReturn);
                }
            },
            error: function(xmlHttpRequest) {
                console.log("SEVERE ERROR trying to contact the dibs server");
            }
        });
    }
}
checkReservation("Michael", "Albinson", "613 305 0359", "13ma100@queensu.ca", "24", "2017/11/22 22:30:00", "1");
// can book without a password (skips the entire verification process)
// can book without a queens email
// can book for up to 14 hours a day
// can book for any time in perpetuity beyond the current date
// Only restriction is that you can not have 2 reservations for the same room at any point in time AND
// you can only have a maximum of 4 reservations at a time