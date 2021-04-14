/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */

var s = document.createElement('script');
s.src = chrome.extension.getURL('js/injected_vcostat.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


function storeAndsendMessage(type, value) {
    // not sure if it is a good idea to solve it this way but here we offset the timezone first before using that
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

    // extracting only the time from current timezone
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString(); 
    var store = {};
    store["vcostat:"+type] = JSON.stringify({
            "date":localISOTime,
            "value":value
    });
    chrome.storage.local.set(store, function() {
        if (chrome.runtime.lastError) {
            console.log("Error Storing: " + chrome.runtime.lastError);
            return 0;
        } 
        chrome.runtime.sendMessage({download: "new"});
    });
    return 1;
}

window.addEventListener("message", function(request) {
    try {
        var resp = JSON.parse(request.data);
        storeAndsendMessage(resp.type, resp.value);
    } catch(err){
        console.log(err);
    }
}, true);

function normal_parse (obj) {
    var items = []; 
    var header = obj.find(".vce-result-header").find(".vce-result-header-row");
    var data  = obj.find(".vce-result-data").find(".vce-result-data-row");

    var h = []; 
    header.find("span").each(function () {
        if ($(this).attr('class') != "desc"){
            // replacing carriage return and too many spaces from header
            h.push($(this).text().replace(/\n|\r/g, "").replace(/\s+/g, " "));
        }
    });
    items.push(h);

    data.each(function() {
        var d = [];
        $(this).find("span").each(function() {
            d.push($(this).text());
        });
        items.push(d);
    });

    return items;
};

const parsing = {
    "FLOW_DUMP"       : ["List Active Flows",normal_parse],
    "ROUTE_DUMP"      : ["Route Table Dump", normal_parse],
    "ROUTES_DETAIL"   : ["List Routes per Prefix",normal_parse],
    "BGP_VIEW"        : ["List BGP Routes", normal_parse],
    "BGP_REDIS_DUMP"  : ["List BGP Redistributed Routes", normal_parse],
    "PATHS_DUMP"      : ["List Paths", normal_parse]
}

if (window.location.href.indexOf("remote-diagnostics") > -1) {
    try {
        $(document).on('click','.runTest', function(event) {
           event.stopPropagation();
           event.stopImmediatePropagation();
           const key = $(this)[0].dataset.test;
           if (key in parsing) {
               $(document).ready(function checkContainer(){
                    if ($('#'+key+'-results').find('.vce-result-tbl').is(':visible')){
                        const found = $('#'+key+'-results').find('.vce-result-tbl');
                        const arr = parsing[key][1](found);  
                        storeAndsendMessage(parsing[key][0],arr);
                    }else{
                        setTimeout(checkContainer, 100); //wait 100 ms, then try again
                    }
               });
           }
        });
    } catch(err) {
        console.log(err);
    }
}
