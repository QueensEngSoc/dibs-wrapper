// this contains some JS functions that are used on the index page

var jsonData = [];
var timeCount = [];

var dateObj = new Date();
var current_hour = dateObj.getHours();
var current_min = dateObj.getMinutes();
if (current_min < 30)
  current_hour--;

var selectedTime = current_hour;
var responseData = [];

$(document).on("change","input[type=radio]", filterList);

$('.chk-container').on('change', filterList);

function filterList() {
    var checkedAttrs = [];

    $('#roomButtons').children().removeClass('hidden');

    var btnSel=$('[name="optradio"]:checked').val();
    roomSizeSelect(btnSel);

    $('.chk-container input').each(function(idx, el) {
        if (el.checked === true)
            checkedAttrs.push($(el).attr('data-value'))
    });
    filterSelect(checkedAttrs);
}

function filterSelect(filtersSelected) {
    $('#roomButtons').children().each(function(idx, el) {
        for (var i in filtersSelected) {
            var $el = $(el);
            if (filtersSelected.hasOwnProperty(i)) {
                if (filtersSelected[i] !== 'onlyFree') {
                    if (!$el.children('input[name=' + filtersSelected[i] + ']')[0].value.includes('true'))
                        $el.addClass('hidden');
                }
                else {
                    if ($el.hasClass('mroom') || $el.hasClass('nroom'))
                        $el.addClass('hidden');
                }
            }
        }
    });
}

function roomSizeSelect(size) {
    $('#roomButtons').children().each(function (idx, el) {
        var $el = $(el);
        var sizeNum = $el.children('[name=roomSize]')[0].value.match(/\d+/)[0];

        if (sizeNum !== size && size !== "on")
            $el.addClass('hidden');

        if (sizeNum === "3" && size === "2")  // temp code to show 111 in the large section, we can figure out the better way to do this later
            $el.removeClass('hidden');
    });
}

//////////////////////////////////// Datepicker stuff ////////////////////////////////////////////

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

    jsonData = document.getElementById('roomData').value;   // get the data for the selected day and parse it
    jsonData = JSON.parse(jsonData);

    timeCountString = document.getElementById('timeCountString').value;
    timeCount = JSON.parse(timeCountString);

    var serverTime = parseInt(document.getElementById('serverTime').value) + 7;
    if (serverTime != current_hour) {
      current_hour = serverTime;
      selectedTime = current_hour;
      showAlert("Different Time Zone Detected", "Hey there, we noticed that you seem to be in a different time zone from us. Just so you know, all times shown here will be in EST (where Queen's is)", false);
    }

    updateTimePicker(0, selectedTime);
});

$('#datepicker').change(function(){
    display("Value Changed! Selected date: " + " input's current value: " + this.value);
    getNewDayData(this.value);
});

function display(msg) {
    console.log(msg);
}

function getNewDayData(day)
{
    $.ajax({
        url: "/index",
        type: "POST",
        data: {day: day},
        dataType: "json",
        success: function (data) {
            jsonData = data.list;
            responseData = data;
            timeCount = data.timeCount;
            updateButtons(jsonData);
            updateTimePicker(responseData.day, responseData.currentHour);
            document.getElementById('roomData').value = JSON.stringify(jsonData);
            filterList();
        },
        error: function (data) {
            console.log("Error: " + data);
            doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
        }
    });
}

function updateButtons(data){
    // if ()
    for (var d = 0; d < data.length; d++){
        var room = data[d];

        var matchingElement = document.getElementById(room.roomNum);

        if (responseData.prettyDate)
            matchingElement.href = "/book/" + room.roomID + "/" + responseData.prettyDate;

        var arrayTime = (selectedTime - 7);
        if (arrayTime >= 0 && arrayTime <= 16 && room.isFree[arrayTime].free){
            matchingElement.classList.remove("mroom");
            matchingElement.classList.remove("nroom");
            matchingElement.classList.add("yroom");
        }
        else
        {
            if (arrayTime >= 0 && arrayTime <= 16 && room.isFree[arrayTime].isMine){
                matchingElement.classList.remove("nroom");
                matchingElement.classList.remove("yroom");
                matchingElement.classList.add("mroom");
            }
            else
            {
                matchingElement.classList.remove("mroom");
                matchingElement.classList.remove("yroom");
                matchingElement.classList.add("nroom");
            }
        }
    }
}

var shown = false;
function showHideFilters(el) {
    $('#filters').fadeToggle(400, 'swing');
    if (shown)
        el.innerText = 'Show More Filters';
    else
        el.innerText = 'Hide Filters';

    shown = !shown;
}

//////////////////////// TIME PICKER STUFF //////////////////////////

$('#timepicker').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
  // do something...
  var value = $('.selectpicker').val();
  console.log('Selected time is: ', value);
  selectedTime = value;
  document.getElementById('serverTime').value = value;
  updateButtons(jsonData);
  filterList();
});

function updateTimePicker(day, startTime){
  if (day > 0){
      generateTimes(7);
  }
  else
      generateTimes(startTime);
}

function generateTimes(startTime, dayStart = 7) {
  var options = [];

  var startHour = (startTime < 7 || startTime > 23) ? 7 : startTime

  for (var i = startHour; i < 23; i++) {
    var amOrPm = (i >= 11) ? " PM" : " AM";
    var amPmTime = ((i) % 12 == 0) ? 12 : i % 12;
    var endAmPmTime = ((i + 1) % 12 == 0) ? 12 : (i + 1) % 12;

    var freeRoomCountForHour = timeCount[i - dayStart].totalFree;
    var pillClass = 'badge-success';
    if (freeRoomCountForHour < 5 && freeRoomCountForHour > 0)
        pillClass = 'badge-warning \' style=\'color: white\'';
    else if (freeRoomCountForHour == 0)
        pillClass = 'badge-danger';

    var option = "<option data-tokens=\"" + amPmTime + " " + i + " " + amOrPm +  "\" value=\"" + i + "\" data-icon=\"fa-heart\"  data-content=\"<span><span class='badge badge-pill " + pillClass + "'>" + freeRoomCountForHour + "</span> "+ amPmTime + ":30-" + endAmPmTime + ":30" + amOrPm + "</span>\" >" + amPmTime + ":30-" + endAmPmTime + ":30" + amOrPm + "</option>"
    // console.log(option);
    options.push(option);
  }

  $('#timepicker').html(options);
  $('#timepicker').selectpicker('refresh');

  if (selectedTime < startTime) {
      selectedTime = startTime;
  }

  var amOrPm = (selectedTime >= 11) ? " PM" : " AM";

  $('#timepicker').selectpicker('val', selectedTime);
}

function showAlert(header, message, success){
  html = "";
  if (!success){
    html += '<div class="alert alert-danger alert-dismissible center-block text-center" role="alert">';
  }
  else
    html += '<div class="alert alert-success alert-dismissible center-block text-center" role="alert">';

  html += '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
    '    <span aria-hidden="true">&times;</span>\n' +
    '  </button>';
  html += '<h4 class="alert-heading">'+header+'</h4>';
  html += '<p>'+message+'</p>';
  html += '</div>'
  $('#message-container').append(html);
  // $("#message-container").alert()

}
