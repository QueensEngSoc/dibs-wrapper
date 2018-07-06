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

function unbookRoomClick(roomID, time, day, owner, element, length){
    // this function gets the current room id, embeds it into the post request, and then sends a post.
    // On success, it returns whether the booking was successful, or the error that occurred

    // console.log("Called my function!");
        var date = new Date;
        var minutes = date.getMinutes();
        var hour = date.getHours();

    if ((day == 0 && time >= hour) || (day == 0 && time >= hour - 1 && minutes < 30) || day > 0 || (roomID < 0))
        $.ajax({
            url: "/accounts/unbook",
            type: "POST",
            data: {roomID: roomID, time: time,day: day,owner: owner, length: length},
            dataType: "json",
            success: function (data) {
                console.log("Header: " + data.HeaderMsg + " body: " + data.BookingStatusMsg + " data: " + data);
                var header = data.HeaderMsg;
                var content = data.BookingStatusMsg;
                var hours = data.HoursNow;
                var limit = data.maxHours;

                doModal(header, content, data.BookStatus);
                // element.classList.remove("ytime");
                // element.classList.add("mtime");
                console.log("Done!");
                // element.value = "Unbooked";

                if (data.unbookedAll){
                    var cardContainerChildren = document.getElementById('bookedRow').children;
                    while (cardContainerChildren.length) {
                          cardContainerChildren[0].remove()
                    }
                }
                else
                    element.closest('.col-sm-6').remove();

                if (data.BookStatus) {
                    var hoursLeft = document.getElementById('hoursLeft');
                    hoursLeft.innerText = ": " + hours + " of " + limit;
                }
            },
            error: function (data) {
                console.log("Error: " + data)
            }
        });
}


document.addEventListener("DOMContentLoaded", function() {
    var cardsDiv = document.getElementById('bookedRow');
    var cards = cardsDiv.getElementsByClassName('col-sm-6');

    for(var i = 0; i < cards.length; i++) {
        var a = cards[i];
        var btn = a.getElementsByClassName('btn btn-danger');
        if (btn[0].disabled){
            document.getElementById('prevBookedRow').appendChild(
                a
            );
            i--;
        }
    }


}, false);

function testDayShift(){
    $.ajax({
        url: "/testDayShift",
        type: "POST",
        data: {},
        dataType: "json",
        success: function (data) {

        },
        error: function (data) {
            console.log("Error: " + data)
        }
    });
}
