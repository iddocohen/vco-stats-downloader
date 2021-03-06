var s = document.createElement('script');
if (window.location.href.indexOf("remote-diagnostics") > -1) {
    s.src = chrome.extension.getURL('js/vcostat.ws.inject.js');
} else {
    s.src = chrome.extension.getURL('js/vcostat.inject.js');
}
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


function storeAndsendMessage(api, type, value) {
    // not sure if it is a good idea to solve it this way but here we offset the timezone first before using that
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

    // extracting only the time from current timezone
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString(); 
    var store = {};
    try {
        value = JSON.parse(value);
    } catch {
        value = value;
    }
    store["vcostat:"+api] = JSON.stringify({
            "date":localISOTime,
            "resp":value
    });
    chrome.storage.local.set(store, function() {
        if (chrome.runtime.lastError) {
            console.log("Error Storing: " + chrome.runtime.lastError);
            return 0;
        } 
        if (type != "db") {
            chrome.runtime.sendMessage({download: "new"});
        }
    });
    return 1;
}

window.addEventListener("message", function(request) {
    try {
        var resp = JSON.parse(request.data);
        storeAndsendMessage(resp.api, resp.type, resp.resp);
    } catch(err){
        console.log(err);
    }
}, true);
