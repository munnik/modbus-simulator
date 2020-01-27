$(function() {
  // setup datepickers to be linked
  $('#fromDatePicker').datetimepicker({
    format: 'Y-MM-DD\\THH:mm:ss\\Z'
  });
  $('#toDatePicker').datetimepicker({
    useCurrent: false,
    format: 'Y-MM-DD\\THH:mm:ss\\Z'
  });
  $("#fromDatePicker").on("change.datetimepicker", function(e) {
    $('#toDatePicker').datetimepicker('minDate', e.date);
  });
  $("#toDatePicker").on("change.datetimepicker", function(e) {
    $('#fromDatePicker').datetimepicker('maxDate', e.date);
  });
  // submit form with js instead of a direct http call
  $('#dataForm').on('submit', function() {
    var vessel = $("#vesselInput :selected").val();
    var path = $("#pathInput :selected").val();
    var rowCount = $('#dataAvailable tr').length;
    console.log(vessel, path);
    $('#dataAvailable tr:last').after(`<tr><td>${rowCount}</td><td>vessels.${vessel}.${path}</td><td>from</td><td>to</td><td>yes</td><td>no</td></tr>`);
    return false;
  });

  $('#vesselInput').on('change', function() {
    var selected = $("#vesselInput :selected").val();
    $("#pathInput").attr('disabled');
    $("#pathInput").empty();
    $.ajax({
      url: `/signalk/v1/api/list/paths/${selected}`,
      dataType: "json",
      success: function(response) {
        try {
          response.paths.forEach(path => $("#pathInput").append(new Option(path, path)));
          $("#pathInput").removeAttr('disabled');
        } catch (e) {
          console.info("Error:" + e);
        }
      },
      error: function(xhr) {
        console.info("Ajax failed Error");
      }
    });
  });

  $.ajax({
    url: "/signalk/v1/api/list/vessels",
    dataType: "json",
    success: function(response) {
      try {
        response.contexts.forEach(urn => $("#vesselInput").append(new Option(urn, urn)));
        $("#vesselInput").removeAttr('disabled');
      } catch (e) {
        console.info("Error:" + e);
      }
    },
    error: function(xhr) {
      console.info("Ajax failed Error");
    }
  });
});
