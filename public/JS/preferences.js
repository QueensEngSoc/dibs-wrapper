"use strict";

var originalValues = {};
var lastTheme = '';
var lastThemeUsed = '';

function launchModal(title) {
    $( '#' + title).toggle();
}

function changeCSS(cssFile, cssLinkIndex) {

  var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

  var newlink = document.createElement("link");
  newlink.setAttribute("rel", "stylesheet");
  newlink.setAttribute("type", "text/css");
  newlink.setAttribute("href", cssFile);

  oldlink.parentNode.replaceChild(newlink, oldlink);
}

function changeBgStyle(theme){
   changeCSS("/CSS/room-style/"+ theme + "-room-style.css", 1);
}

function submitChanges() {
    var cp = jQuery.extend({}, originalValues);
    getOriginalValues();

    $.ajax({
        url: '/preferences',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(originalValues)
    }).done(function(data) {
        launchModal('successAndRedirect');
        changeBgStyle(originalValues.useTheme);
        $('button.btn-success')[0].disabled = true;
    }).fail(function(err) {
        console.log(err);
        launchModal("error");
        originalValues = cp;
    });
}

$(document).ready(function() {
    lastTheme = document.getElementById('currentTheme').value;
    intialSetup();  // set the colors and select to the user selected theme

    $('select[title=color]').on('change', function(val) {
        changeAll(val);
        checkDiff();
    });

    $('input[type=color]').on('change', function() {
        checkDiff();
    });

    $('input[type=checkbox]').on('change', function() {
        checkDiff();
    });

    getOriginalValues();
});

function changeAll() {
    var newTheme =  $('select[title=color]').val();
    if (newTheme !== 'custom') {
        if (lastTheme === 'custom')
            showColorInputs(false);

        $('.color-swatch').each(function (it, element) {
            element.classList.replace(lastThemeUsed, newTheme);
        });
        lastThemeUsed = newTheme;
    }
    else {
        showColorInputs(true);
    }

    lastTheme = newTheme;
}

function intialSetup() {
   $('select[title=color]')[0].value = lastTheme;

}

function showColorInputs(showIt) {
    if (showIt) {
        $('[data-colorinput=true]').each(function(i, el) {el.classList.remove('hidden')});
        $('.color-swatch').hide();
    }
    else {
        $('[data-colorinput=true]').each(function(i, el) {el.classList.add('hidden')});
        $('.color-swatch').show();
    }
}

function checkDiff() {
    var cp = jQuery.extend({}, originalValues);
    getOriginalValues();
    $('button.btn-success')[0].disabled = JSON.stringify(cp) === JSON.stringify(originalValues);
    originalValues = cp;
}

function getOriginalValues() {
    $('input[type=checkbox]').each(function(index, el) {
        originalValues[el.title] = el.checked;
        originalValues.customColors = getColors();
        originalValues.useTheme = $('select[title=color]').val();
        originalValues.customColors.useCustom = originalValues.useTheme === 'custom';
        lastThemeUsed = originalValues.useTheme;

        if ($('.color-swatch').hasClass('hidden'))
            lastTheme = 'custom';
        else
            lastTheme = lastThemeUsed;
    });
}

function getColors() {
    var returnVals = {};
    $('input[type=color]').each(function(it, is) {
        returnVals[is.title.replace('-picker', '')] = is.value;
    });

    return returnVals;
}
