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

$('#datepicker').change(function(){
    var time = $('#timepicker').val;
    display("Value Changed! Selected date: " + this.value + " at time: " + time);

    getNewDayData(this.value, 0);
});

var dateObj = new Date();
var current_hour = dateObj.getHours();
var current_min = dateObj.getMinutes();
var day = 0;
var disabledHours = [0,1,2,3,4,5,6,23,24];
if (current_min < 30)
    current_hour--;

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
if (day == 0){
    for (var i = 7; i < current_hour; i++){
        disabledHours.push(i);
    }
}
else
    disabledHours = [0,1,2,3,4,5,6,23,24];

// if (current_min < 30)
//     current_hour --;

var date = dateObj;
date.setHours(current_hour);
date.setMinutes(30);
// console.log(date.toLocaleTimeString());

$(function () { // using Tempus Dominus Boostrap 4 dateTimePicker
    $('#timepicker1').datetimepicker({
        format: 'LT',
        stepping: 30,
        disabledHours: disabledHours,
        defaultDate: date
    });
    // $('#timepicker1').datetimepicker('date', date.toTimeString());
});

function display(msg) {
    console.log(msg);
}

function getNewDayData(day, time)
{
    $.ajax({
        url: "/map",
        type: "POST",
        data: {day: day, time: time},
        dataType: "json",
        success: function (data) {
            updateMap(data);
        },
        error: function (data) {
            console.log("Error: " + data);
            doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
        }
    });
}

function updateMap(data){

}