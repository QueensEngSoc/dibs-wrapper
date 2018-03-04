// this contains some JS functions that are used on the index and room pages

function dibsRoomBookClick(roomID, time, element, roomName, length, day){
    // this function gets the current room id, embeds it into the post request, and then sends a post.
    // On success, it returns whether the booking was successful, or the error that occurred

    if (element.classList.contains("mtime")) {
        doModal("Room Already Booked!", "You've already booked this room, you can't book it again!", false);
    } else if (element.classList.contains("ntime")) {
        doModal("Room Already Booked!", "Someone has already booked the room, try a different time.", false);
    }
    else {
        $.ajax({
            url: "/bookroom",
            type: "POST",
            data: {roomID: roomID, time: time, length: length, roomName: roomName, day: day},
            dataType: "json",
            success: function (data) {
                successfulBooking(data, element)
            },
            error: function (data) {
                console.log("Error: " + data);
                doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
            }
        });
    }
}

function doModal(heading, formContent, success) {
    html =  '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true" aria-describedby="Booking confirmation modal">';
    html += '<div class="modal-dialog" role="document">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h5 class="modal-title" id="exampleModalLabel">'+heading+'</h5>';
    html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
    html += '<span aria-hidden="true">&times;</span>'
    html += '</button>'
    html += '</div>';
    html += '<div class="modal-body">';
    html += formContent;
    if(!success)
        html += '<br/>' +
            '<video height="400" width="300" autoplay loop>\n' +
            '  <source src="/video/carson-1.webm" type="video/webm">\n' +
            '  Your browser does not support the video tag.\n' +
            '</video>';

    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">Close</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    // jQuery.noConflict();
    // $('#dynamicModal').css({'position':'fixed;','top':'40%','left':'50%','transform': 'translate(-50%, -50%);'});
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');


    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
}

function successfulBooking(data, element) {
    console.log("Header: " + data.HeaderMsg + " body: " + data.BookingStatusMsg + " data: " + data);
    var header = data.HeaderMsg;
    var content = data.BookingStatusMsg;
    if (header.indexOf("You must login") >= 0){
        window.location.href = ('/login?book=' + content);
    }
    doModal(header, content, data.BookStatus);
    if (data.BookStatus) {
        element.classList.remove("ytime");
        element.classList.add("mtime");
    }
    console.log("Done!");
}

function successfulBookingMulti(data, ids) {
    console.log("Header: " + data.HeaderMsg + " body: " + data.BookingStatusMsg + " data: " + data);
    var header = data.HeaderMsg;
    var content = data.BookingStatusMsg;
    if (header.indexOf("You must login") >= 0){
        window.location.href = ('/login?book=' + content);
    }
    doModal(header, content, data.BookStatus);
    if (data.BookStatus) {
        console.log(ids);
        for (id of ids) {
            document.getElementById(id).classList.remove("ytime");
            document.getElementById(id).classList.remove("ctime");
            document.getElementById(id).classList.add("mtime");
        }
    }
    console.log("Done!");
}