
function exportCSVFile(items, fileTitle) {

    var csv = items.map(e => e.join(",")).join("\r\n");
    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = exportedFilenmae;
    link.classList.add("buttonDownload");
    return link;
}

$(document).on('click','.tablinks',function(event) {
    var i, tabcontent, tablinks;
    tabName = $(this)[0].id;
    tabcontent = document.getElementsByClassName("row");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tabcontent = document.querySelectorAll(".row.header");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "table-row";
    }
    tabcontent = document.getElementsByClassName(tabName);
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "table-row";
        
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    event.currentTarget.className += " active";
});

$(function () {
    const byteSize = str => new Blob([str]).size;
    
    chrome.storage.local.get(function(result){
        if (chrome.runtime.lastError) {
            console.log("Error retrieving index: " + chrome.runtime.lastError);
            return;
        }
        for (const [ukey,value] of Object.entries(result)) {
           var key = ukey.split(":")[1];
           var match = $('div[data-title="Name"]:contains('+key+')');
           if (match.length > 0){
                var data = JSON.parse(value);
                var date = match.next(".cell");
                var link = match.next(".cell").next(".cell");
                var rdate = data.date.split("T");
                date.text(rdate[0]+" "+rdate[1].replace(/^[^:]*([0-2]\d:[0-5]\d).*$/, "$1"));
                link.html(exportCSVFile(data.value,key));
                //match.parent().css("visibility","");
                chrome.runtime.sendMessage({download: "clear"});
           }
        }
    });
});


