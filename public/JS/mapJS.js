jQuery(function ($) {

    $("#datepicker").datepicker({
        minDate: 0,
        maxDate: "+13D",
        onSelect: function (d, i) {
            if (d !== i.lastVal) {
                $(this).change();
            }
        }
    });
});

$(document).ready(function () {
    $("#datepicker").val("Today");
});

var today = new Date();
var dateObj = new Date();
var current_hour = dateObj.getHours();
var oldTime = current_hour;

$('#datepicker').change(function () {
    dateObj = new Date(this.value);
    date = dateObj;
    date.setHours(current_hour);
    date.setMinutes(30);
    console.log(date.toLocaleTimeString());

    minHour = (date.getDay() != today.getDay()) ? 7 : current_hour;
    getNewDayData(this.value, oldTime);
});

var date = dateObj;
date.setHours(current_hour);
date.setMinutes(30);
console.log(date.toLocaleTimeString());
var minHour = (today.getDay() != date.getDay()) ? 7 : current_hour;

var mapData;
var specificTimeData;
var timeCount;
var selectedHour = current_hour;

function getNewDayData(day, time) {
    $.ajax({
        url: "/map",
        type: "POST",
        data: {day: day, time: time},
        dataType: "json",
        success: function (data) {
            mapData = data.roomStatus;
            mapData = mapData.replace(/&quot;/g, '"');
            mapData = JSON.parse(mapData);

            timeCount = data.timeCount;
            updateSidebar(false);
            generateSpecificTimeData();
            updateMap();
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

function updateMap() {

    var element = document.getElementById("floor1");

    if (current == 'second') {
        element = document.getElementById("floor2");
    }
    else if (current == 'third') {
        element = document.getElementById("floor3");
    }

    // if (mapData)
    //     specificTimeData = mapData[selectedHour];

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

var side = document.getElementById("sidebar");

function updateSidebar() {
    var count = timeCount;
    count = count.replace(/&quot;/g, '"');
    var data = JSON.parse(count);
    for (var i = 0; i < data.length; i++) {
        var timeElement = side.querySelectorAll("button[value=\"" + i + "\"]")[0];
        if (i < minHour - 7 - 1) {
            timeElement.setAttribute("style", "display:none!important;");
        } else {
            // if (setActive){
            //     if (i == minHour - 7 - 1)
            //         timeElement.classList.add("active");
            // }
            var span = timeElement.getElementsByTagName('span')[0];
            span.innerText = data[i].totalCount - data[i].hourCount;
            timeElement.style.display = 'block';
        }
    }
}

$(document).ready(function () {
    // parse map data
    mapData = mapData.replace(/&quot;/g, '"');
    mapData = JSON.parse(mapData);

    updateSidebar(true);
    changeSidebarTime(minHour - 7 - 1, 16);
});

function generateSpecificTimeData(value){

    if (!value)
        value = selectedHour;

  for (var i = 0; i < mapData.length; i++){
    var room = mapData[i];
    specificTimeData.push({
      hasPhone: room.hasPhone,
      isFree: room.isFree[value].free,
      isMine: room.isFree[value].isMine,
      room: room.room,
      roomID: room.roomID,
      roomNum: room.roomNum,
      size: room.size
    });
  }

}

/////////////////////////////////// MAP UPDATING FROM TIME CHANGE //////////////////////////////////////////////////////

function changeSidebarTime(value, length) {
    if (length == undefined)
        length = 16;

    for (var i = 0; i < length; i++) {

        var timeElement = side.querySelectorAll("button[value=\"" + i + "\"]")[0];
        if (i == value)
            timeElement.classList.add("active");
        else
            timeElement.classList.remove("active");
    }

    selectedHour = value;
    specificTimeData = [];

    for (var i = 0; i < mapData.length; i++){
        var room = mapData[i];
        specificTimeData.push({
            hasPhone: room.hasPhone,
            isFree: room.isFree[value].free,
            isMine: room.isFree[value].isMine,
            room: room.room,
            roomID: room.roomID,
            roomNum: room.roomNum,
            size: room.size
        });
    }

    updateMap();
}

/////////////////////////////////// SVG STUFF //////////////////////////////////////////////////////////////////////////
var f1 = document.getElementById("floor1"); // does the initial load for the SVG, and goes through and flips the class for any room that is booked

// It's important to add an load event listener to the object,
// as it will load the svg doc asynchronously
f1.addEventListener("load", function () {
  console.log("loaded floor 1!");

    // get the inner DOM of alpha.svg
    var svgDoc = f1.contentDocument;
    // get the inner element by id

    var roomStatus = specificTimeData;

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
    console.log("loaded floor 2!");
    // get the inner DOM of alpha.svg
    var svgDoc = f2.contentDocument;
    // get the inner element by id

    var roomStatus = specificTimeData;

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
    console.log("loaded floor 3!");
    // get the inner DOM of alpha.svg
    var svgDoc = f3.contentDocument;
    // get the inner element by id

    var roomStatus = specificTimeData;

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
