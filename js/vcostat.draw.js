function itemsToHtml (allRows) {
    var table = '<table id="dt-table">';
    allRows[0].pop();
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        if (singleRow === 0) {
            table += '<thead>';
            table += '<tr>';
        } else {
            table += '<tr>';
        }
        var rowCells = allRows[singleRow];
        for(var rowCell = 0; rowCell < rowCells.length; rowCell++){
            if(singleRow === 0){
                table += '<th>';
                table += rowCells[rowCell];
                table += '</th>';
            } else {
                table += '<td>';
                table += rowCells[rowCell];
                table += '</td>';
            }
        }
        if (singleRow === 0) {
            table += '</tr>';
            table += '</thead>';
            table += '<tbody>';
        } else {
            table += '</tr>';
        }
    }
    table += '</tbody>';
    table += '</table>';

    return table;
}

function getTableData(table) {
  const dataArray = [],
        timeArr = [],
        dataArr = [],
        trendArr = [];

  table.rows({ search: "applied" }).every(function() {
    const data = this.data();
    timeArr.push(data[0]);
    dataArr.push(parseFloat(data[3]));
    trendArr.push(parseFloat(data[data.length-2]));
  });

  dataArray.push(timeArr, dataArr, trendArr);

  return dataArray;
}

function createHighcharts(data) {
  Highcharts.setOptions({
    //lang: {
    //  thousandsSep: ","
    //}
  });
 
  Highcharts.chart("chart", {
    title: {
      text: "Capacity Trendline"
    },
    subtitle: {
      text: "Tx/Rx vs Calculated Trend"
    },
    xAxis: [
      {
        categories: data[0],
        labels: {
          step: 10,
          rotation: -45
        }
      }
    ],
    yAxis: [
      {
        // first yaxis
        title: {
          text: "Data"
        }
      },
      {
        // secondary yaxis
        title: {
          text: "Trendline"
        },
        min: 0,
        opposite: true
      }
    ],
    navigator :{
        enabled: true
    },

    scrollbar :{
        enabled: true
    },
    rangeSelector:{
        enabled: false
    },
    tooltip: {
        formatter: function() {
            if (this.y > 1000000000) {
                return Highcharts.numberFormat(this.y / 1000000000, 2) + " GBytes"
            }else if (this.y > 1000000) {
                return Highcharts.numberFormat(this.y / 1000000, 2) + " MBytes"
            } else if (this.y > 1000) {
                return Highcharts.numberFormat(this.y / 1000, 2) + " KBytes";
            } else if (this.y <= 0) {
                return "0 Bytes";
            } else {
                return this.y
            }
        }
    },
    series: [
      {
        name: "Data",
        color: "#0071A7",
        type: "spline",
        data: data[1]
      },
      {
        name: "Trendline",
        color: "#FF404E",
        type: "spline",
        data: data[2]
      }
    ],
    //tooltip: {
    //  shared: true
    //},
    legend: {
      backgroundColor: "#ececec",
      shadow: true
    },
    credits: {
      enabled: false
    },
    noData: {
      style: {
        fontSize: "16px"
      }
    }
  });
}

let draw = false;  

function setTableEvents(table) {
  // listen for page clicks
  table.on("page", () => {
    draw = true;
  });

  // listen for updates and adjust the chart accordingly
  table.on("draw", () => {
    if (draw) {
      draw = false;
    } else {
      const tableData = getTableData(table);
      createHighcharts(tableData);
    }
  });
}
 
$(function () {
    var html = "";
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action != "draw"){
           return true;
        }
        const items = JSON.parse(request.items);
        html = itemsToHtml(items);

        $(".container").append(html);    
        $('#dt-table thead tr').clone(true).appendTo( '#dt-table thead' );
        $('#dt-table thead tr:eq(1) th').each(function (i) {
            var title = $(this).text();
            $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
            $('input',this).on( 'keyup change', function () {
                if ( table.column(i).search() !== this.value ) {
                    table
                        .column(i)
                        .search( this.value )
                        .draw();
                }
            });
        });
        const table = $("#dt-table").DataTable({
            orderCellsTop: true,
            fixedHeader: true
        });
        const tableData = getTableData(table);
        createHighcharts(tableData);
        setTableEvents(table);
    });
});
         
