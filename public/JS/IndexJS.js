// this contains some JS functions that are used on the index page

function roomSizeSelect(size){

    var buttonDiv = document.getElementById('roomButtons');
    var buttons = buttonDiv.getElementsByClassName('btn btn-lg');

    for(var i = 1; i < buttons.length; i++){
        var a = buttons[i];
        var btnSize = a.querySelector("#roomSize").value;
        var sizeNum = btnSize.match(/\d+/)[0];

        if (sizeNum != size && size != "on")
            a.style.display = 'none';
        else
            a.style.display = 'inline-block';
    }
}

$(document).on("change","input[type=radio]",function(){
    var btnSel=$('[name="optradio"]:checked').val();
    roomSizeSelect(btnSel)
});
