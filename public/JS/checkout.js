//old onclick string:
//var click = 'dibsRoomBookClick(document.getElementById("roomID").value, {{startTime}}, this, "{{../room}}", 1, {{../day}})';

var selected = [];

function select(startTime, element) {
    if (element.classList.contains("mtime")) {
        doModal("Room Already Booked!", "You've already booked this room at this time, you can't book it again!", false);
    } else if (element.classList.contains("ntime")) {
        doModal("Room Already Booked!", "Someone else has already booked the room for this time, try another time.", false);
    } else {
        selected.push(startTime);
        element.setAttribute("class", "ctime");
    }
}

function checkout(roomID, day) {
    $.ajax({
        url: "/bookcheckout",
        type: "POST",
        data: {roomID: roomID, times: selected, day: day},
        dataType: "json",
        success: function(data) {
            successfulBookingMulti(data, selected);
        },
        error: function(data){
            console.log("Error: " + data);
            doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
        }
    });
}