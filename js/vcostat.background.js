chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
              var url = new URL(changeInfo.url);
              if (url.hostname.includes("velocloud.net")){
                    console.log(changeInfo.url);
                    chrome.tabs.executeScript(tabId, { file: "js/vcostat.jquery.js" }, 
                    _=> {
                            let e = chrome.runtime.lastError;
                            if(e !== undefined){
                                console.log(tabId, _, e);
                            }
                            chrome.tabs.executeScript(tabId, { file: "js/vcostat.cs.js" });
                    });
              }
         }
   }
);



var vcocnt;
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(function(result) {
        if (chrome.runtime.lastError) {
            console.log("Error retrieving index: " + chrome.runtime.lastError);
            return;
        }
        for (const [ukey, _] of Object.entries(result)){
            if (ukey.includes("vcostat:")) {
                console.log("Found key to delete: "+ukey);
                chrome.storage.local.remove([ukey],function(){
                    if (chrome.runtime.lastError) {
                    
                        console.log("Could not delete key: " + chrome.runtime.lastError);
                    }else{
                        console.log("Deleted");
                    }
                });
            }
        }
    });
    vcocnt = 0;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.download == "new"){
        chrome.browserAction.setBadgeBackgroundColor({ color: [122, 186, 122, 255] });
        vcocnt += 1;  
        chrome.browserAction.setBadgeText({text: 'New' });
    } else if (request.download == "clear"){
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        vcocnt = 0;
        chrome.browserAction.setBadgeText({text: '' });
    }
});

