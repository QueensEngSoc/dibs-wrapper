"use strict";

var originalValues = {};
var lastTheme = '';
var lastThemeUsed = '';

function launchModal(title) {
    $( '#' + title).toggle();
}

function submitChanges() {
    var cp = jQuery.extend({}, originalValues);
    getOriginalValues();

    $.ajax({
        url: '/preferences',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(originalValues)
    }).done(function() {
        launchModal('successAndRedirect');
        $('button.btn-success')[0].disabled = true;
    }).fail(function(err) {
        console.log(err);
        launchModal("error");
        originalValues = cp;
    });
}

$(document).ready(function() {
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