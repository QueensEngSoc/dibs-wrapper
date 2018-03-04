var selected = [];

function select(time, element) {
    if (element.classList.contains("mtime")) {
        doModal("Room Already Booked!", "You've already booked this room at this time, you can't book it again!", false);
    } else if (element.classList.contains("ntime")) {
        doModal("Room Already Booked!", "Someone else has already booked the room for this time, try another time.", false);
    } else {
        var i = selected.findIndex(function (element) {
            return element == time;
        });
        if (i == -1) {
            selected.push(time);
            element.setAttribute("class", "ctime");
        } else {
            element.setAttribute("class", "ytime");
            selected.splice(i, 1);
        }
    }
}

function checkout(roomID, day) {
    if (selected.length > 0) {
        $.ajax({
            url: "/bookcheckout",
            type: "POST",
            data: {roomID: roomID, times: selected, day: day},
            dataType: "json",
            success: function (data) {
                successfulBookingMulti(data, selected);
            },
            error: function (data) {
                console.log("Error: " + data);
                doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
                for (id of selected) {
                    document.getElementById(id).classList.remove("ctime");
                    document.getElementById(id).classList.remove("mtime");
                    document.getElementById(id).classList.add("ytime");
                }
            }
        });
    }
}