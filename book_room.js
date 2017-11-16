const $ = require('najax');

function checkReservation(f, l, e) {
    var dibsWSURL = 'https://queensu.evanced.info/admin/dibs/api/reservations/post';
    var reservationSent = false;
    if (!reservationSent) {
        reservationSent = true;
        var firstName, lastName, phoneNumber, emailAddress;

        // if ($.trim($('#FirstName').val()) != '*First Name') {
        //     firstName = $.trim($('#FirstName').val());
        // } else {
        //     firstName = "";
        // }
        //
        // if ($.trim($('#LastName').val()) != '*Last Name') {
        //     lastName = $.trim($('#LastName').val());
        // } else {
        //     lastName = "";
        // }
        //
        // if ($.trim($('#Phone').val()) != 'Phone# (for text confirmation)') {
        //     phoneNumber = $.trim($('#Phone').val());
        // } else {
        //     phoneNumber = "";
        // }
        //
        //
        // if ($.trim($('#EmailAddress').val()) != '*Email') {
        //     emailAddress = $.trim($('#EmailAddress').val());
        // } else {
        //     emailAddress = "";
        // }

        firstName = f;
        lastName = l;
        emailAddress = e;
        phoneNumber = "";

        var postData = {
            firstName: firstName,
            lastName: lastName,
            roomid: "18",//$('#SelectedRoomID').val(),
            startDate: "2017/11/16 22:30:00",//$('#SelectedStartTime').val(),
            reservationLength: "10",//$('#SelectedTime').val(),
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
            langCode: "en-US",//$('#SelectedLang').val(),
            staffAccess: false
        };

        $.post({
            url: dibsWSURL,
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            async: true,
            success: function(objReturn) {
                if (objReturn.IsSuccess == true) {
                    console.log('Submitted!');
                    // $('SuccessMessage').val(objReturn.Message);
                    verifySubmitBool = true;
                    // $('#frmReg').submit();
                } else {
                    console.log('Error: ' + objReturn);// $('#divErrorMsg').html(objReturn.Message);
                    // $('errorModal').modal('show');
                    // $('#btnCallDibs').bootstrapBtn('reset');
                    reservationSent = false;
                }
            },
            error: function(xmlHttpRequest) {
                // $('#btnCallDibs').bootstrapBtn('reset');
            }
        });
    }
}
checkReservation();