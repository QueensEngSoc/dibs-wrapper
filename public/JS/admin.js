//HOMEPAGE FUNCTIONS

var creationShown = false;
function toggleCreation(el) {
    $('#schedule').fadeToggle(400, 'swing');
    if (creationShown)
        el.innerText = 'Create a Schedule';
    else
        el.innerText = 'Hide Create a Schedule';

    creationShown = !creationShown;
}

var enableShown = false;
function toggleEnable(el) {
    $('#enable').fadeToggle(400, 'swing');
    if (enableShown)
        el.innerText = 'Enable or Disable Rooms';
    else
        el.innerText = 'Hide Enable or Disable Rooms';

    enableShown = !enableShown;
}

//SCHEDULE CREATION
var validInput = true;
//DATE PICKER
var startDPicker = document.getElementById("startDatePicker");
var endDPicker = document.getElementById("end\DatePicker");

var date = new Date();
var yesterday = new Date();
yesterday.setTime(date.getTime() - 3600*24);

startDPicker.value = date.toJSON().slice(0, 10);
startDPicker.min = yesterday.toJSON().slice(0, 10);
endDPicker.value = date.toJSON().slice(0, 10);
endDPicker.min = yesterday.toJSON().slice(0, 10);

var dateCheck = function() {
    //Parsing the date input fields to get the dates in JS date objects
    var s = startDPicker.value.split('-');
    var startDate = new Date(parseInt(s[0]), parseInt(s[1])-1, parseInt(s[2]), 0, 0, 0, 0);
    var e = endDPicker.value.split('-');
    var endDate = new Date(parseInt(e[0]), parseInt(e[1])-1, parseInt(e[2]), 0, 0, 0, 0);

    //Checking if the range of dates is valid
    var error = $('#dateError')[0];
    if (startDate > endDate) {
        validInput = false;

        error.innerHTML = "The starting date is after the end date, please fix the range of dates.";
    } else {
        validInput = true;
        error.innerHTML = "";
    }
};

startDPicker.onchange = dateCheck;
endDPicker.onchange = dateCheck;

//TIME PICKER
var startTPicker = $('#startTimePicker')[0];
var endTPicker = $('#endTimePicker')[0];
var error = $('#timeError')[0];

//Setting up the time pickers
startTPicker.min = "00:00";
startTPicker.max = "23:59";
endTPicker.min = "00:00";
endTPicker.max = "23:59";
// tPicker.onclick = function() {
//     error = $('#timeError')[0];
//     tPicker = $('#timePicker')[0];
//
//     // if (parseInt(tPicker.value[1]) < 7 || parseInt(tPicker.value[1]) > 22) {
//     //     error.innerHTML = "You have chosen a time outside the available times to book rooms, please choose a valid one.";
//     // } else {
//     //     error.innerHTML = "";
//     // }
// };

var selectedSched = [];
//Select room
function selectSched(button) {
    var id = parseInt(button.name);

    if (selectedSched.includes(id)){
        var i = selectedSched.findIndex(function (element) {
            return element == id;
        });
        selectedSched.splice(i, 1);
        button.setAttribute("class", "ntime");
    } else {
        selectedSched.push(id);
        button.setAttribute("class", "ytime");
    }
}

//Selects all unselected buttons
function selectAllSched() {
    var unselected = $("[section=sched][class=ntime]");
    console.log(unselected);
    for (button of unselected) {
        selectSched(button);
    }
}

//Submit Schedule to the server where it will add it to the database
function submitSchedule() {
    //get inputs from screen
    var startTPicker = $('#startTimePicker')[0];
    var endTPicker = $('#endTimePicker')[0];
    var startDPicker = document.getElementById("startDatePicker");
    var endDPicker = document.getElementById("end\DatePicker");

    var sD = startDPicker.value.split('-');
    var sT = startTPicker.value.split(':');
    var startDate = new Date(parseInt(sD[0]), parseInt(sD[1])-1, parseInt(sD[2]), parseInt(sT[0]), parseInt(sT[1]), 0, 0);

    var eD = endDPicker.value.split('-');
    var eT = endTPicker.value.split(':');
    var endDate = new Date(parseInt(eD[0]), parseInt(eD[1])-1, parseInt(eD[2]), parseInt(eT[0]), parseInt(eT[1]), 0, 0);

    //setup what needs to be sent
    var days = Math.floor((endDate-startDate)/(1000*60*60*24));
    var hours = [];
    for (var i = parseInt(sT[0]); i < parseInt(eT[0]); i++)
        hours.push(i);
    var rooms = selected;

    //send er
    $.ajax({
        url: "/schedule",
        type: "POST",
        data: {startDate: JSON.stringify(startDate), length: days, hours: hours, rooms: rooms},
        dataType: "json",
        success: function(data) {
            alert(data.msg);
        },
        error: function(data) {
            alert(data.msg);
        }
    });
}


var selected = [];
//Select room
function select(button) {
    var id = parseInt(button.name);

    if (selected.includes(id)){
        var i = selected.findIndex(function (element) {
            return element == id;
        });
        selected.splice(i, 1);
        button.setAttribute("class", "ntime");
    } else {
        selected.push(id);
        button.setAttribute("class", "ytime");
    }
}

//Selects all unselected buttons
function selectAll() {
    var unselected = $("[section=status][class=ntime]");
    for (button of unselected) {
        select(button);
    }
}

var list = $("[section=status][class=ytime]");
for (var i = 0; i < list.length; i++) {
    selected.push(parseInt(list[i].name));
}

function submitStatus() {
    var toDisable = [];
    var ntimes = $("[section=status][class=ntime]");
    for (var i = 0; i < ntimes.length; i++) {
        toDisable.push(parseInt(ntimes[i].name));
    }

    $.ajax({
        url: "/status",
        type: "POST",
        data: {roomID: selected, toDisable: toDisable},
        dataType: "json",
        success: function(data) {
            alert(data.msg);
        },
        error: function(data) {
            alert(data.msg);
        }
    });
}