function showAlert(header, message, success){
    html = "";
    if (!success){
        html += '<div class="alert alert-danger alert-dismissible fade show" role="alert">';
    }
    else
        html += '<div class="alert alert-success alert-dismissible fade show" role="alert">';

    html += '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
            '    <span aria-hidden="true">&times;</span>\n' +
            '  </button>';
    html += '<h4 class="alert-heading">'+header+'</h4>';
    html += '<p>'+message+'</p>';
    html += '</div>'
}

function doModal(heading, formContent, success) {
    html =  '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>'+heading+'</h4>';
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
    // jQuery.noConflict();
    $("#dynamicModal").modal();
    $("#dynamicModal").modal('show');

    $('#dynamicModal').on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
}

function unbookRoomClick(roomID, time, day, owner, element){
    // this function gets the current room id, embeds it into the post request, and then sends a post.
    // On success, it returns whether the booking was successful, or the error that occurred

    // console.log("Called my function!");
        var date = new Date;
        var minutes = date.getMinutes();
        var hour = date.getHours();

    if ((day >= 0 && time >= hour) || (day >= 0 && time >= hour - 1 && minutes < 30) || (roomID < 0))
        $.ajax({
            url: "/accounts/unbook",
            type: "POST",
            data: JSON.stringify([roomID, time, day, owner]),
            success: function (data) {
                console.log("Header: " + data.HeaderMsg + " body: " + data.BookingStatusMsg + " data: " + data);
                var header = data.HeaderMsg;
                var content = data.BookingStatusMsg;
                doModal(header, content, data.BookStatus);
                // element.classList.remove("ytime");
                // element.classList.add("mtime");
                console.log("Done!");
                // element.value = "Unbooked";
                element.closest('.col-sm-6').remove();
            },
            error: function (data) {
                console.log("Error: " + data)
            }
        });
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

function mergeBookings(){   // this function merges the multi-hour bookings into a single card, and removes the other cards  It's some ugly JS, but it works!
    var bookedRow = document.getElementById("bookedRow");   // the row with all of the bookings in it
    var cards = bookedRow.getElementsByClassName("card");   // the card element containing the booking info we want
    var bookingHash = "";                                   // the generated hash for each booking.  Note: 5 chars *should* be enough, but may have to up it
    var ival = 0;                                           // the i value of the base card

    for (var i = 0; i < cards.length; i++){                 // for each card in the list...
        if (bookingHash != ""){                             // if the stored hash is not nothing (it is only on the first loop)
            var tempHash = cards[i].getElementsByTagName('input')[0].value; // get the hash of the card we are looking at
            if (tempHash == bookingHash){                   // if they match (should mean same booking)
                var baseCard = cards[ival];                 // set the basecard var to the i value we saved
                var time = baseCard.getElementsByTagName('h4')[0].innerText;    // get the element inside the basecard var with a type of h4
                var pos = getPosition(time, '-', 2);        // get the position of the second - in the string
                var tempStr = time.substr(pos + 2);         // get the substring of the pos + 2 (the start of the ending hour)
                var colnPos = getPosition(tempStr, ':', 1); // get the pos of the colon (to determine if the time is 1 or 2 digits long
                var endStr = tempStr;                       // save this ending string, we need it for later
                tempStr = tempStr.substr(0, colnPos);       // cut the substring to the colon posistion, leaving the time
                var timeInt = parseInt(tempStr, 10);        // turn the time to an int
                timeInt++;                                  // add one
                time = time.substr(0, pos + 2) + timeInt + endStr.substr(colnPos);  // add everything back into a single string
                baseCard.getElementsByTagName('h4')[0].innerText = time;            // set the card title to the revised time string
                cards[i].closest('.col-sm-6').remove();     // remove the card with the duplicate hash
                i--;                                        // deincrement i by one since we deleted a card (else we would not get all cards in the list)
            }
            else        // else this hash did not match, and we are on a different booking.  Save the new hash and posistion of the card
            {
                bookingHash = cards[i].getElementsByTagName('input')[0].value;
                ival = i;
            }
        }
        bookingHash = cards[i].getElementsByTagName('input')[0].value;  // on the first run, save the hash of the first card.
    }

}

document.addEventListener("DOMContentLoaded", function() {
    var hasJson = document.getElementById("hasJson").value.trim();
    if (hasJson.indexOf('true') >= 0 ){
        var json = document.getElementById("json").value;
        var obj = JSON.parse(json);

        doModal(obj.header, obj.bookMsg, obj.success);

    }

    mergeBookings();    // call the mergeBookings function on page load
}, false);