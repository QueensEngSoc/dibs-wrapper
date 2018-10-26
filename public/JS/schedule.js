//DATE PICKER
var dPicker = document.getElementById("datePicker");

var date = new Date();
var yesterday = new Date();
yesterday.setTime(date.getTime() - 3600*24);

dPicker.value = date.toJSON().slice(0, 10);
dPicker.min = yesterday.toJSON().slice(0, 10);

//TIME PICKER
var tPicker = document.getElementById("timePicker");
