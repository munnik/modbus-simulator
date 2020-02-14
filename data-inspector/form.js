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
    var vessel = $("#vesselInput").val();
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
        ).first();
        $(
          `#${selector} > td:nth-child(6) > button`
        ).first().removeAttr("disabled");
        icon.removeClass("fa-hourglass-half");
        if (response.objects.length == 0) {
          icon.addClass("fa-exclamation-triangle");
          var button = $(
            `#${selector} > td:nth-child(5) > button`
          ).first();
          button.attr("disabled", true);
        } else {
          icon.addClass("fa-check");
        }
        receivedData.push(response);
      }
    });
    return false;
  });

  //get list of paths once vessel has been selected
  $('#vesselInput').on('change', function() {
    var selected = $("#vesselInput").val();
    $("#pathInput").attr('disabled', true);
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
    url: `/signalk/v1/api/list/vessels`,
    dataType: "json",
    success: function(response) {
      try {
        vessels = [];
        response.contexts.forEach(urn => vessels.push({
          value: urn,
          label: urn
        }));
        $("#vesselInput").removeAttr('disabled');
        $("#vesselInput").autocompleter({
          source: vessels
        });
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
  // display the graph
  google.charts.load('current', {
    'packages': ['corechart', 'table']
  });
  google.charts.setOnLoadCallback(showTableAndGraph);

  function showTableAndGraph() {
    // create all the columns
    var columns = [{
      label: 'ts',
      type: 'date'
    }];
    for (let i = 0; i < receivedData.length; i++) {
      for (let j = 0; j < receivedData[i].objects.length; j++) {
        for (let k = 0; k < receivedData[i].objects[j].properties.length; k++) {
          let field = receivedData[i].objects[j].properties[k].path;
          columns.push({
            label: field,
            type: 'number'
          });
        }
      }
    }

    timeSeries = {};
    for (let i = 0; i < receivedData.length; i++) {
      for (let j = 0; j < receivedData[i].objects[0].timestamps.length; j++) {
        var ts = receivedData[i].objects[0].timestamps[j];
        var value = receivedData[i].objects[0].properties[0].values[j];

        // check if timestamp already exist, otherwise make an empty list of values
        if (!(ts in timeSeries)) {
          timeSeries[ts] = [];
          for (let k = 0; k < receivedData.length; k++) {
            timeSeries[ts].push(undefined);
          }
        }
        timeSeries[ts][i] = value;
      }
    }
    dataSet = [];
    for (ts in timeSeries) {
      dataSet.push([new Date(ts)].concat(timeSeries[ts]));
    }
    var data = google.visualization.arrayToDataTable([columns].concat(dataSet));
    let dateFormatter = new google.visualization.DateFormat({
      pattern: 'yyyy-MM-ddTHH:mm:ss'
    });
    dateFormatter.format(data, 0);



    var options = {
      chart: {
        title: 'Vessel data'
      },
      curveType: 'function',
      legend: {
        position: 'bottom'
      }
    };

    var table = new google.visualization.Table(document.getElementById('gtable'));
    table.draw(data, {
      showRowNumber: false,
      width: '100%',
      height: '100%'
    });

    var chart = new google.visualization.LineChart(document.getElementById('ggraph'));
    chart.draw(data, options);
  }


  // todo display the table
}

function removeData(path) {
  console.log("removing: ", path);
  var selector = $.escapeSelector(`${path}`);
  var row = $(`#${selector}`).first();
  var index = $('#dataAvailable tr').index(row) - 1;
  row.remove();
  receivedData.splice(index, 1);
}
