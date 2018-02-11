function checkReservation() {
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

        firstName = 'Andrew';
        lastName = 'Farley';
        emailAddress = '16amf8@queensu.ca';
        phoneNumber = "";

        var postData = {
            firstName: firstName,
            lastName: lastName,
            roomid: "22",//$('#SelectedRoomID').val(),
            startDate: "2017/11/14 22:30:00",//$('#SelectedStartTime').val(),
            reservationLength: "1",//$('#SelectedTime').val(),
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
            langCode: "en-US",//$('#SelectedLang').val(),
            staffAccess: false
        };

        $.ajax({
            type: "POST",
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
                    console.log(objReturn.Message);// $('#divErrorMsg').html(objReturn.Message);
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