function quickBook() {
    $.ajax({
        url: '/quicky',
        type: 'POST',
        contentType: 'application/json'
    }).done(function(data) {
        successfulBooking(data);
    }).fail(function(err) {
        doModal("Room Booking Error!", err, false);
    });
}