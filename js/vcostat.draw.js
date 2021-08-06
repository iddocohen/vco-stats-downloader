let title = "";
let pointStart = 0;
let pointInterval = 0;
let yAxis = "";

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

function headerToHtml (allRows) {
    var table = '<table id="dt-table" class="display nowrap">';
    allRows[0].pop();
    for (var singleRow = 0; singleRow < 1; singleRow++) {
        if (singleRow === 0) {
            table += '<thead>';
            table += '<tr>';
        }
        var rowCells = allRows[singleRow];
        for(var rowCell = 0; rowCell < rowCells.length; rowCell++){
            if(singleRow === 0){
                table += '<th>';
                table += rowCells[rowCell];
                table += '</th>';
            }
        }
        if (singleRow === 0) {
            table += '</tr>';
            table += '</thead>';
        }
    }
    table += '</tbody>';
    table += '</table>';

    return table;
}
function bytes(bytes, label) {
    if (bytes == 0) return '';
    var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes)/Math.log(1000));
    var value = ((bytes/Math.pow(1000, Math.floor(e))).toFixed(2));
    e = (e<0) ? (-e) : e;
    if (label) value += ' ' + s[e];
    return value;
}

function getTableData(table) {
  const dataArray = [],
        timeArr = [],
        dataArr = [],
        trendArr = [];

  table.rows({ search: "applied" }).every(function() {
    let data = this.data();
    
    timeArr.push(data[0]);
    // TODO: Hack and need to be done via config not via title
    if (title == "Systems") {
        dataArr.push(parseFloat(data[2]));
    } else {
        dataArr.push(parseFloat(data[3]));
    }
    trendArr.push(parseFloat(data[data.length-2]));
  });

  dataArray.push(timeArr, dataArr, trendArr);

  return dataArray;
}

function createHighcharts2(data) {
  var start = +new Date();
  Highcharts.chart("chart", {
     chart: {
            events: {
                load: function () {
                    if (!window.TestController) {
                        this.setTitle(null, {
                            text: 'Built chart in ' + (new Date() - start) + 'ms'
                        });
                    }
                }
            },
            zoomType: 'x'
    },
    title: {
      text: title+" - Capacity Trendline"
    },
    rangeSelector: {
        enabled: true,
        buttons: [{
            type: 'day',
            count: 3,
            text: '3d'
        }, {
            type: 'week',
            count: 1,
            text: '1w'
        }, {
            type: 'month',
            count: 1,
            text: '1m'
        }, {
            type: 'month',
            count: 6,
            text: '6m'
        }, {
            type: 'year',
            count: 1,
            text: '1y'
        }, {
            type: 'all',
            text: 'All'
        }],
        selected: 6
    },

    navigator :{
        enabled: true
    },

    scrollbar :{
        enabled: true
    },
    xAxis: {
        type:'datetime'
    },
    yAxis: {
        title: {
            text: yAxis
        },
        labels: {
            formatter: function () {
                /* TODO: Hack again...*/
                if (title !== "Systems") {
                    return bytes(this.value, true);
                } else {
                    return this.value;
                }
            }
        }
    },

    subtitle: {
        text: 'Built chart in ...', // dummy text to reserve space for dynamic subtitle
    },

    tooltip: {
        formatter: function() {
            /* TODO: Hack again...*/
            if (title !== "Systems") {
                return bytes(this.y, true);
            } else {
                return this.y;
            }
        }
    },
    series: [
    { 
        name: yAxis + ' over Time',
        data: data[1],
        pointStart: pointStart,
        pointInterval: pointInterval,
        tooltip: {
            valueDecimals: 0,
        }
    },
    {
        name: 'Trendline over Time',
        data: data[2],
        pointStart: pointStart,
        pointInterval: pointInterval,
        tooltip: {
            valueDecimals: 0,
        }
    }]
  });  
} 


function createHighcharts(data) {
  var start = +new Date();

  Highcharts.setOptions({
    //lang: {
    //  thousandsSep: ","
    //}
  });
 
  Highcharts.chart("chart", {
     chart: {
            events: {
                load: function () {
                    if (!window.TestController) {
                        this.setTitle(null, {
                            text: 'Built chart in ' + (new Date() - start) + 'ms'
                        });
                    }
                }
            },
            zoomType: 'x'
    },
    title: {
      text: title+" - Capacity Trendline"
    },
    xAxis:
    [{
        categories: data[0],
        labels: {
          rotation: -45
        }
      }
    ],
    /*
      {
        type: 'datetime',
        tickPositions: data[0],
        labels: {
            formatter: function() {
                 return Highcharts.dateFormat('%m/%d/%y', this.value);
            },
            rotation: -45
        }
    },
  plotOptions: {
    series: {
      pointStart: data[0][0],
      pointInterval: 1000 * 60 * 60 * 24
    }
  },
    */
    yAxis: [
      {
        // first yaxis
        title: {
          text: "Metric data"
        },
        labels: {
            formatter: function () {
                /* TODO: Hack again...*/
                if (title !== "Systems") {
                    return bytes(this.value, true);
                } else {
                    return this.value;
                }
            }
        },
        min: 0
      },
      {
        // secondary yaxis
        title: {
          text: "Trend line data"
        },
        labels: {
            formatter: function () {
                /* TODO: Hack again...*/
                if (title !== "Systems") {
                    return bytes(this.value, true);
                } else {
                    return this.value;
                }
            }
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
            /* TODO: Hack again...*/
            if (title !== "Systems") {
                return bytes(this.y, true);
            } else {
                return this.y;
            }
            // TODO: Hack as well. Maybe new HighChart needed per type?
            /*
            if (title != "Systems" && this.y > 1000000000) {
                return Highcharts.numberFormat(this.y / 1000000000, 2) + " GBytes"
            }else if (title != "Systems" && this.y > 1000000) {
                return Highcharts.numberFormat(this.y / 1000000, 2) + " MBytes"
            } else if (title != "Systems" && this.y > 1000) {
                return Highcharts.numberFormat(this.y / 1000, 2) + " KBytes";
            } else if (title != "Systems" && this.y == 0) {
                return "0 Bytes";
            } else {
                return this.y
            }
            */
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

let triggerdraw = false;  

function setTableEvents(table) {
  // listen for page clicks
  table.on("page", () => {
    triggerdraw = true;
  });

  // listen for updates and adjust the chart accordingly
  
  table.on("change draw", () => {
    if (triggerdraw) {
      triggerdraw = false;
    } else {
      const tableData = getTableData(table);
      createHighcharts2(tableData);
    }
  });
}

// https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}
 
$(function () {
    var html = "";
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action != "draw"){
           return true;
        }
        const draw = JSON.parse(request.draw);
        title = draw.title;        
        pointStart = draw.pointStart;
        pointInterval = draw.pointInterval;
        const items = JSON.parse(request.items);

        html = headerToHtml(items);
        items.shift();
        $(".container").append(html);      
        //html = itemsToHtml(items);
        //$(".container").append(html);    
        $('#dt-table thead tr').clone(true).appendTo( '#dt-table thead' );
        $('#dt-table thead tr:eq(1) th').each(function (i) {
            let header = $(this).text();
            if (!draw.table.hasOwnProperty(header)) {
                $(this).html( '<input type="text" placeholder="Search '+header+'" />' );
                $('input',this).on( 'keyup change', delay(function () {
                    if ( table.column(i).search() !== this.value ) {
                        table
                            .column(i)
                            .search( this.value )
                            .draw();
                    }
                }, 500));
            } else if (draw.table[header].hasOwnProperty("dropdown")) {
                let option = "<select id='"+header+"'>";
                $.each(draw.table[header].dropdown, function (key, value) {
                    option += "<option value='"+key+"'>"+key+"</option>";
                });
                option += "</select>";
                $(this).html(option);      
                $('select', this).on('change', function(e) {
                    if($(this)[0].id === "Metric") {
                        let name = this.value.replace(/([A-Z])/g, ' $1').trim();
                        name = name.charAt(0).toUpperCase() + name.slice(1);
                        yAxis = name;
                    }
                    if (table.column(i).search() !== this.value ) {
                        table
                            .column(i)
                            .search( this.value )
                            .draw();
                    }
                });
            } 
        });
        const table = $("#dt-table").DataTable( {
            data:           items,
            deferRender:    true,
            scrollY:        300,
            scrollCollapse: false,
            scroller:       true,
            ordering:       false,
            fixedHeader:    true
        });

        $('select').prop("selectedIndex", 0).change();

        const tableData = getTableData(table);
        createHighcharts2(tableData);
        setTableEvents(table);  
    });
});
         
