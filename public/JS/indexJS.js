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

}

var $select = $('filterSelect');
$select.change(function () {    // initializes the dropdown list group listener, so we can track any selections
    // Last saved state;
    var lastState = $(this).data('total'),
        // New state;
        changedState = $(this).find('option:selected').length,

        txt = (lastState < changedState ?
            'selected' : (
                lastState > changedState ?
                    'Deselected' :
                    'Only one option is selected'));
    // save state
    $(this).data('total', changedState);
    $('#console').append('<p>' + lastState + ' => ' + changedState + '<span>' + txt + '</span></p>');
    filterSelect(changedState);

// Initializing tracker
}).data('total', $select.find('option:selected').length);
