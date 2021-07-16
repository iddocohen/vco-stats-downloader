$(document).on('click','.tablinks',function(event) {
    var i, tabcontent, tablinks;
    tabName = $(this)[0].id;
    $(this).find('.new').hide();
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

$(document).on('click','a', function(event) {
    event.preventDefault();
    var link = $(this);
    const api  = link.parent().parent().attr('id');
    chrome.storage.local.get(["vcostat:"+api], function(result){
        if (chrome.runtime.lastError) {
            console.log("Error retrieving index: " + chrome.runtime.lastError);
            return;
        }
        for (const [_, value] of Object.entries(result)) {
            const data     = JSON.parse(value);
            var resp = undefined;
            try {
                resp = JSON.parse(data.resp);
            } catch {
                resp = data.resp;
            }
            const items    = config[api].csv(resp); 

            const csv      = items.map(e => e.join(",")).join("\r\n");
            //const filename = config[api].name + '.csv' || 'export.csv';
            const blob     = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url      = URL.createObjectURL(blob);
            location.href    = url;
            //link.href      = url;
            //link.download  = filename;
            //console.log(link);
            //link.click();
        }
    }); 
});

$(function () {
    const byteSize = str => new Blob([str]).size;

    $.each(config, function(key, value) {
        if (value.type == "db") {
            return true;
        }
        var div = `
            <div class="${value.css_class} row" id="${key}">
                <div class="cell" data-title="Name">${value.name}</div>
                <div class="cell" data-title="Created"></div>
                <div class="cell" data-title="Link"></div>
            </div>
        `; 
        $('.row').last().after(div);
    });

    chrome.storage.local.get(function(result){
        if (chrome.runtime.lastError) {
            console.log("Error retrieving index: " + chrome.runtime.lastError);
            return;
        }
        for (const [ukey,value] of Object.entries(result)) {
            const api = ukey.split(":")[1];

            if(!config.hasOwnProperty(api)) {
                continue;
            }

            const data = JSON.parse(value);

            if (config[api].type == "db") {
                var resp = undefined;
                try {
                    resp = JSON.parse(data.resp);
                } catch {
                    resp = data.resp;
                }
                config[api].resp = resp;
                continue;
            }

            const date = data.date.split("T");
            const match = $("#"+api.replaceAll('/', '\\/'));

            const btn_id = "#"+config[api].css_class;
            $(btn_id).find('.new').show();

            var created = match.find('div[data-title="Created"]');
            var link    = match.find('div[data-title="Link"]');

            created.text(date[0]+" "+date[1].replace(/^[^:]*([0-2]\d:[0-5]\d).*$/, "$1"));
 
            link.html(`<a href='#' class='buttonDownload'></a>`);

            chrome.runtime.sendMessage({download: "clear"});

        }
    }); 
});


