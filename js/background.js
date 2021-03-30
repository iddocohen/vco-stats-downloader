var vcocnt;
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.clear(function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
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

