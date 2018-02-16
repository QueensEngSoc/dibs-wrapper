// this contains some JS functions that are used on the index page

function roomSizeSelect(size){

    var buttonDiv = document.getElementById('roomButtons');
    var buttons = buttonDiv.getElementsByClassName('btn btn-lg');

    for(var i = 0; i < buttons.length; i++){
        var a = buttons[i];
        var btnSize = a.querySelector("#roomSize").value;
        var sizeNum = btnSize.match(/\d+/)[0];

        if (sizeNum != size && size != "on")
            a.style.display = 'none';
        else
            a.style.display = 'inline-block';

        if (sizeNum == 3 && size == 2)  // temp code to show 111 in the large section, we can figure out the better way to do this later
            a.style.display = 'inline-block';
    }
}

$(document).on("change","input[type=radio]",function(){ // initializes the radio button group listener, so we can track any selections
    var btnSel=$('[name="optradio"]:checked').val();
    roomSizeSelect(btnSel)
});

function filterSelect(filtersSelected){

    var buttonDiv = document.getElementById('roomButtons');
    var buttons = buttonDiv.getElementsByClassName('btn btn-lg');

    for(var i = 0; i < buttons.length; i++) {
        var a = buttons[i];

        if (filtersSelected == undefined) {
            a.style.display = 'inline-block';
        }
        else {
            if (filtersSelected.indexOf("hasTV") >= 0) {
                var hasTV = a.querySelector("#hasTV").value;

                if (hasTV.indexOf("true") < 0)
                    a.style.display = 'none';
                else
                    a.style.display = 'inline-block';
            }
            if (filtersSelected.indexOf("onlyFree") >= 0) {
                if (a.style.display != 'none') {
                    if (a.classList.contains('nroom'))
                        a.style.display = 'none';
                    else
                        a.style.display = 'inline-block';
                }
            }
            if (filtersSelected.indexOf("hasPhone") >= 0) {
                if (a.style.display != 'none') {
                    var hasPhone = a.querySelector("#hasPhone").value;

                    if (hasPhone.indexOf("true") < 0)
                        a.style.display = 'none';
                    else
                        a.style.display = 'inline-block';
                }
            }
        }
    }

}

var options = [];

$('.dropdown-menu a').on( 'click', function( event ) {

    var $target = $( event.currentTarget ),
        val = $target.attr( 'data-value' ),
        $inp = $target.find( 'input' ),
        idx;

        var sel = undefined;
        if ($inp[0].checked == true)
            sel = $inp[0].value;
        // if (@inp[0].isSelected())

    if ( ( idx = options.indexOf( val ) ) > -1 ) {
        options.splice( idx, 1 );
        setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
    } else {
        options.push( val );
        setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
    }

    $( event.target ).blur();

    console.log( options + " Selected: " + sel );
    filterSelect(sel);
    return false;
});

//////////////////////////////////// Datepicker stuff ////////////////////////////////////////////

jQuery(function($) {

    $("#datepicker").datepicker({
        minDate: 0,
        maxDate: "+1M",
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
            updateButtons(data);
        },
        error: function (data) {
            console.log("Error: " + data);
            doModal("Oops, something went wrong :(", "Try again, and if the issue persists, please contact the ESSDEV Team", false)
        }
    });
}

function updateButtons(data){
    for (var d = 0; d < data.list.length; d++){
        var room = data.list[d];

        var matchingElement = document.getElementById(room.roomNum);
        matchingElement.href = "/book/" + room.roomID + "/" + data.prettyDate;

        if (room.isFree){
            matchingElement.classList.remove("mroom");
            matchingElement.classList.remove("nroom");
            matchingElement.classList.add("yroom");
        }
        else
        {
            if (room.isMine){
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
