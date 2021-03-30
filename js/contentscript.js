/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */

var s = document.createElement('script');
s.src = chrome.extension.getURL('js/injected.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener("message", function(request) {
    try {
        var resp = JSON.parse(request.data);
        var store = {};
        store[resp.type] = JSON.stringify({
            "date":resp.date,
            "value":resp.value
        });
        chrome.storage.local.set(store, function() {
            if (chrome.runtime.lastError) {
                console.log("Error Storing: " + chrome.runtime.lastError);
            }
        });
        chrome.runtime.sendMessage({download: "new"});
    } catch(err){
        console.log(err);
    }
}, true);

