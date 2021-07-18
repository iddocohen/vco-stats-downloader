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

            var items = [];
            if (config[api].hasOwnProperty("regression")) {
                if (config[api].regression){
                    var setup = link.parent().parent().find('div[data-title="Setup"]');
                    items = config[api].csv(resp, setup);
                }else{
                    items = config[api].csv(resp); 
                }
            }else{
                items = config[api].csv(resp); 
            }


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
                <div class="cell" data-title="Setup"></div>
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

            if (config[api].hasOwnProperty("regression")) {
                if (config[api].regression){
                    var setup = match.find('div[data-title="Setup"]');
                    setup.html(`
                         Capacity trendline type:<br>
                         <select id="reg_type">
                            <option value="none" default>[None]</option>
                            <option value="linear">Linear</option>
                            <option value="logarithmic">Logarithmic</option>
                            <option value="polynomial_2">Polynomial (2 degree)</option>
                         </select><br> 
                         For future:<br> 
                         <select id="reg_time">
                            <option value="0" default>[None]</option>
                            <option value="1">1 Day</option>
                            <option value="7">1 Week</option>
                            <option value="14">2 Weeks</option>
                            <option value="31">4 Weeks</option>
                         </select>
                    `); 
                }
            } 

            chrome.runtime.sendMessage({download: "clear"});

        }
    }); 
});


