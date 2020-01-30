var receivedData = [];
$(function() {
  // setup datepickers to be linked and disabled on load
  $('#fromDatePicker').datetimepicker({
    format: 'Y-MM-DD\\THH:mm:ss\\Z',
    timeZone: 'Etc/UTC'
  });
  $('#fromDatePicker').datetimepicker('disable');
  $('#toDatePicker').datetimepicker({
    useCurrent: false,
    timeZone: 'Etc/UTC',
    format: 'Y-MM-DD\\THH:mm:ss\\Z'
  });
  $('#toDatePicker').datetimepicker('disable');
  $("#fromDatePicker").on("change.datetimepicker", function(e) {
    $('#toDatePicker').datetimepicker('minDate', e.date);
    $('#toDatePicker').datetimepicker('enable');
  });
  $("#toDatePicker").on("change.datetimepicker", function(e) {
    $('#fromDatePicker').datetimepicker('maxDate', e.date);
  });


  // submit form with js instead of a direct http call
  $('#dataForm').on('submit', function() {
    var vessel = $("#vesselInput :selected").val();
    var path = $("#pathInput :selected").val();
    var fullpath = `${vessel}.${path}`;
    var from = $("#fromDatePicker").datetimepicker('viewDate')._d;
    var to = $("#toDatePicker").datetimepicker('viewDate')._d;
    $('#dataAvailable tr:last').after(createDataAvailableRow(fullpath, from.toISOString(), to.toISOString()));

    fullpath = fullpath.split('.').join('/');
    $.ajax({
      url: `/signalk/v1/api/history/${fullpath}`,
      data: {
        start: from.toISOString(),
        end: to.toISOString()
      },
      dataType: "json",
      success: function(response) {
        var selector = $.escapeSelector(`${vessel}.${path}`);
        var icon = $(
          `#${selector} > td:nth-child(4) > i`
        );
        var button = $(
          `#${selector} > td:nth-child(6) > button`
        );
        icon.removeClass("fa-hourglass-half");
        icon.addClass("fa-check");
        button.removeAttr("disabled");
        receivedData.push(response);
      }
    });
    return false;
  });

  //get list of paths once vessel has been selected
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

  // enable first date picker after path has been selected
  $('#pathInput').on('change', function() {
    $('#fromDatePicker').datetimepicker('enable');
  });

  // get list of vessels and enable the path input
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

function createDataAvailableRow(pathValue, fromValue, toValue) {
  var result = document.createElement('tr');
  result.id = pathValue;

  var path = document.createElement('td');
  path.appendChild(document.createTextNode(pathValue));
  result.appendChild(path);

  var from = document.createElement('td');
  from.appendChild(document.createTextNode(fromValue));
  result.appendChild(from);

  var to = document.createElement('td');
  to.appendChild(document.createTextNode(toValue));
  result.appendChild(to);

  var available = document.createElement('td');
  var logo = document.createElement('i');
  logo.classList.add('fa');
  logo.classList.add('fa-hourglass-half');
  available.appendChild(logo);
  result.appendChild(available);

  var show = document.createElement('td');
  var showBtn = document.createElement("button");
  showBtn.type = "button";
  showBtn.classList.add('btn');
  showBtn.classList.add('btn-primary');
  showBtn.classList.add('btn-sm');
  showBtn.appendChild(document.createTextNode("Show"));
  showBtn.onclick = function() {
    showData(pathValue);
  };
  show.appendChild(showBtn);
  result.appendChild(show);

  var remove = document.createElement('td');
  var removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.classList.add('btn');
  removeBtn.classList.add('btn-primary');
  removeBtn.classList.add('btn-sm');
  removeBtn.setAttribute("disabled", "");
  removeBtn.appendChild(document.createTextNode("Remove"));
  removeBtn.onclick = function() {
    removeData(pathValue);
  };
  remove.appendChild(removeBtn);
  result.appendChild(remove);
  return result;

}

function showData(path) {
  console.log("showing: ", path);
  //TODO actually show data
}

function removeData(path) {
  console.log("removing: ", path);
  var selector = $.escapeSelector(`${path}`);
  var row = $(`#${selector}`).first();
  var index = $('#dataAvailable tr').index(row) - 1;
  row.remove();
  receivedData.splice(index, 1);
}
