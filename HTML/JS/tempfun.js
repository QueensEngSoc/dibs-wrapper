/**
 * Handlebars Template!
 * Currently has a fixed context, but if room is changed, site will reflect changes
 * Nothing stopping errors atm
 */
$(document).ready(function () {

    var source  = $("#template-test").html();
    var template = Handlebars.compile(source);

    var context = {
        room: "224",
        size: "Small",
        tv: "Does not have",
        special: "This room is a test room!"
    };
    var comphtml = template(context);

    $(document.body).append(comphtml);
});