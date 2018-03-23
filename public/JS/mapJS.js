jQuery(function($) {

    $("#datepicker").datepicker({
        minDate: 0,
        maxDate: "+13D",
        onSelect: function(d,i){
            if(d !== i.lastVal){
                $(this).change();
            }
        }
    });
});

$(document).ready(function() {
    $("#datepicker").val("Today");
});

var today = new Date();
var dateObj = new Date();
var current_hour = dateObj.getHours();
var current_min = dateObj.getMinutes();
var oldTime = current_hour;

$('#datepicker').change(function(){
    var time = $('#timepicker').val;
    display("Value Changed! Selected date: " + this.value + " at time: " + time);
    dateObj = new Date(this.value);
    date = dateObj;
    date.setHours(current_hour);
    date.setMinutes(30);
    console.log(date.toLocaleTimeString());

    minHour = (date.getDay() != today.getDay()) ? 7 : current_hour;

    $('input.timepicker').data('TimePicker').options.minHour = minHour;
    $('input.timepicker').data('TimePicker').items = null;
    $('input.timepicker').data('TimePicker').widget.instance = null;

    getNewDayData(this.value, oldTime);
});

// var disabledHours = [0,1,2,3,4,5,6,23,24];
// if (current_min < 30)
//     current_hour--;

// old timepicker stuff, may still be needed :(  This timepicker looks pretty, but has no events, so it's kinda useless...
// $('#timepicker').timepicki({show_meridian: false,
//     min_hour_value: current_hour,
//     max_hour_value:22,
//     step_size_minutes:0,
//     start_time: [current_hour, "30"],
//     overflow_minutes:true,
//     increase_direction:'up',
//     disable_keyboard_mobile: true});
//
// $(document).ready(function() {
//     $("#timepicker").val("Now");
// });
//
// $("#timepicker").change(function(){
//     display("Value Changed! Selected Time: " + " input's current value: " + this.val);
//     var date = $('#datepicker').value;
//     getNewDayData(date, this.value);
// });

// if (day == 0){
//     for (var i = 7; i < current_hour; i++){
//         disabledHours.push(i);
//     }
// }
// else
//     disabledHours = [0,1,2,3,4,5,6,23,24];
//
// if (current_min < 30)
//     current_hour --;

var date = dateObj;
date.setHours(current_hour);
date.setMinutes(30);
console.log(date.toLocaleTimeString());
var minHour = (today.getDay() != date.getDay()) ? 7 : current_hour - 1 ;

$(function () { // using Tempus Dominus Boostrap 4 dateTimePicker
    $('input.timepicker').timepicker({
        timeFormat: 'h:mm p',
        //minTime: date2, // 11:45:00 AM,
        minHour: minHour,
        minMinutes: 30,
        maxHour: 23,
        startTime: date, // 3:00:00 PM - noon
        interval: 60, // 15 minutes

        change: function(time) {
            timepickerChange(time);
        }
    });
});

function timepickerChange(time) {
    if (time != oldTime)
    {
        oldTime = time.getHours();
        var pick = $('#datepicker');
        var dateStr = pick[0].value;
        var dateTime = new Date(dateStr);
        if (dateStr == 'Today')
            var dateTime = new Date();

        console.log("Time: " + time.getHours() + " Date: " + dateTime);
        getNewDayData(dateTime, time.getHours());
    }
}

function display(msg) {
    console.log(msg);
}

var mapData;

function getNewDayData(day, time)
{
    $.ajax({
        url: "/map",
        type: "POST",
        data: {day: day, time: time},
        dataType: "json",
        success: function (data) {
            mapData = data.roomStatus;
            updateMap();
            if (data.currentHour != oldTime)
            {
                var dateTime = new Date();
                dateTime.setHours(data.currentHour);
                dateTime.setMinutes(30);
                $('input.timepicker').data('TimePicker').options.defaultTime = dateTime;
                $('input.timepicker').data('TimePicker').items = null;
                $('input.timepicker').data('TimePicker').widget.instance = null;
            }
        },
        error: function (data) {
            console.log("Error: " + data);
            doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
        }
    });
}

var current = 'first';

function switchTo(toThis) {
    if (toThis === current)
        return;

    switchVisible(current, toThis);
    current = toThis;
}

function switchVisible(from, to) {
    $('#' + from).addClass('hidden');
    $('#' + from + '-button').removeClass('active');
    $('#' + to).removeClass('hidden');
    $('#' + to + '-button').addClass('active');
}

function updateMap(){

    var element = document.getElementById("floor1");

    if (current == 'second') {
        element = document.getElementById("floor2");
    }
    else if (current == 'third') {
        element = document.getElementById("floor3");
    }

    var event; // The custom event that will be created
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("load", true, true);
    } else {
        event = document.createEventObject();
        event.eventType = "load";
    }
    event.eventName = "dataavailable";

    if (document.createEvent) {
        element.dispatchEvent(event);
    } else {
        element.fireEvent("on" + event.eventType, event);
    }

}

var f1 = document.getElementById("floor1");

// It's important to add an load event listener to the object,
// as it will load the svg doc asynchronously
f1.addEventListener("load", function () {

    // get the inner DOM of alpha.svg
    var svgDoc = f1.contentDocument;
    // get the inner element by id

    var roomStat = mapData;
    roomStat = roomStat.replace(/&quot;/g, '"');

    var roomStatus = JSON.parse(roomStat);
    <!--var roomStatus = {{roomStatus}};-->
    roomStatus.forEach(function (room) {
        var svgRoom = svgDoc.getElementById(room.roomNum.toLowerCase());
        if (svgRoom != null) {
            if (!room.isFree) {
                if (room.isMine)
                    svgRoom.classList.add('mine');
                else
                    svgRoom.classList.add('booked');
            }
            else {
                svgRoom.classList.remove('mine');
                svgRoom.classList.remove('booked');
            }
        }
    });
}, false);

var f2 = document.getElementById("floor2");

// It's important to add an load event listener to the object,
// as it will load the svg doc asynchronously
f2.addEventListener("load", function () {
    console.log("loaded floor 1!");
    // get the inner DOM of alpha.svg
    var svgDoc = f2.contentDocument;
    // get the inner element by id

    var roomStat = mapData;
    roomStat = roomStat.replace(/&quot;/g, '"');

    var roomStatus = JSON.parse(roomStat);
    <!--var roomStatus = {{roomStatus}};-->
    roomStatus.forEach(function (room) {
        var svgRoom = svgDoc.getElementById(room.roomNum.toLowerCase());
        if (svgRoom != null) {
            if (!room.isFree) {
                if (room.isMine)
                    svgRoom.classList.add('mine');
                else
                    svgRoom.classList.add('booked');
            }
            else {
                svgRoom.classList.remove('mine');
                svgRoom.classList.remove('booked');
            }
        }
    });

}, false);

var f3 = document.getElementById("floor3");

// It's important to add an load event listener to the object,
// as it will load the svg doc asynchronously
f3.addEventListener("load", function () {

    // get the inner DOM of alpha.svg
    var svgDoc = f3.contentDocument;
    // get the inner element by id

    var roomStat = mapData;
    roomStat = roomStat.replace(/&quot;/g, '"');

    var roomStatus = JSON.parse(roomStat);
    <!--var roomStatus = {{roomStatus}};-->
    roomStatus.forEach(function (room) {
        if (!room.isFree) {
            var svgRoom = svgDoc.getElementById(room.roomNum.toLowerCase());
            var svgRoom = svgDoc.getElementById(room.roomNum.toLowerCase());
            if (svgRoom != null) {
                if (!room.isFree) {
                    if (room.isMine)
                        svgRoom.classList.add('mine');
                    else
                        svgRoom.classList.add('booked');
                }
                else {
                    svgRoom.classList.remove('mine');
                    svgRoom.classList.remove('booked');
                }
            }
        }
    });

}, false);
