$(document).ready(function () {
    $("#filter_form").submit(function () {
        $(this).find(":input").filter(function(){return !this.value;}).attr("disabled", "disabled");
    });
    $("#filter_form").find(":input").prop("disabled", false);
});