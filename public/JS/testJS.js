function testHello() {
    alert("hello world")
};

function dibsRoomBookClick(roomID, time, element){
    // this function gets the current room id, embeds it into the post request, and then sends a post.
    // On success, it returns whether the booking was successful, or the error that occurred

    // console.log("Called my function!");

    if (element.classList.contains("mtime"))
    {
        doModal("Room Already Booked!", "You've already booked this room, you can't book it again!", false);
    }
    else {
        $.ajax({
            url: "/bookroom",
            type: "POST",
            // data: JSON.stringify([roomID, time]),
            data: JSON.stringify([roomID, time]),
            success: function (data) {
                console.log("Header: " + data.HeaderMsg + " body: " + data.BookingStatusMsg + " data: " + data);
                var header = data.HeaderMsg;
                var content = data.BookingStatusMsg;
                doModal(header, content, data.BookStatus);
                element.classList.remove("ytime");
                element.classList.add("mtime");
                console.log("Done!");
            },
            error: function (data) {
                console.log("Error: " + data)
            }
        });
    }
}

function doModal(heading, formContent, success) {
    html =  '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>'+heading+'</h4>'
    html += '</div>';
    html += '<div class="modal-body">';
    html += formContent;
    if(!success)
        html += '<video height="400" width="300" autoplay loop>\n' +
            '  <source src="video/carson-1.webm" type="video/webm">\n' +
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
    jQuery.noConflict();
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
}