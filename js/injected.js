(function(xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function(header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function(postData) {

        this.addEventListener('load', function() {
            var endTime = (new Date()).toISOString();

            var myUrl = this._url ? this._url.toLowerCase() : this._url;
            if(myUrl) {

                if (postData) {
                    if (typeof postData === 'string') {
                        try {
                            // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
                            this._requestHeaders = postData;    
                        } catch(err) {
                            console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
                            console.log(err);
                        }
                    } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
                            // do something if you need
                    }
                }

                // here you get the RESPONSE HEADERS
                var responseHeaders = this.getAllResponseHeaders();

                if ( this.responseType != 'blob' && this.responseText) {
                    // responseText is string or null
                    try {

                        // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
                        var arr = this.responseText;

                        // need to only handel POST requests for VCO APIs
                        if (this._method == "POST"){ 
                            var req = JSON.parse(this._requestHeaders);
                            var resp = JSON.parse(arr);
                            //console.log(req);
                            //console.log(resp);
                            
                            // not sure if it is a good idea to solve it this way but here we offset the timezone first before using that
                            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

                            // extracting only the time from current timezone
                            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().replace(/^[^:]*([0-2]\d:[0-5]\d).*$/, "$1"); 
                            
                            if (req.method == 'metrics/getEdgeLinkSeries'  ||
                                req.method == 'metrics/getEdgeAppSeries'   ||
                                req.method == 'metrics/getEdgeDeviceSeries'||
                                req.method == 'metrics/getEdgeDestSeries'
                            ){
                                var items = [];
                                var name = "";

                                // adding the headers of the CSV as first entry in the array
                                switch(req.method){
                                    // TODO: there is no good way to figure out the difference between Transport or Business Priority (same API). Hence sending it to the same row in popup.html.
                                    case "metrics/getEdgeLinkSeries": 
                                          items.push(["Timestamp", "Interface", "Metric", "Data"]); 
                                          name = "Transport/Business Priority";
                                          break;
                                    case "metrics/getEdgeAppSeries" : 
                                          items.push(["Timestamp", "Application ID", "Metric", "Data"]); 
                                          name = "Applications";
                                          break;
                                    case "metrics/getEdgeDeviceSeries" :
                                          items.push(["Timestamp", "MAC Address", "Metric", "Data"]); 
                                          name = "Sources";
                                          break;
                                    case "metrics/getEdgeDestSeries":
                                          items.push(["Timestamp", "Destination", "Metric", "Data"]); 
                                          name = "Destinations";
                                          break;
         
                                }
                                // going through Object (from JSON) to get relevant pieces
                                for (const [_, type] of Object.entries(resp.result)) {
                                    for (const [_, dir] of Object.entries(type.series)) {
                                        var typeval = "";
                                        var timestamp = 0;
                                        switch(req.method){
                                                case "metrics/getEdgeLinkSeries":
                                                    timestamp = dir.startTime;
                                                    typeval = type.link.interface;
                                                    break;
                                                case "metrics/getEdgeAppSeries" :
                                                    timestamp = new Date(dir.startTime).getTime();
                                                    // using UI info to get the real name of application. Other option do an API call, but saving that.
                                                    typeval = document.querySelectorAll("[data-id='"+type.name+"']")[0].innerText;
                                                    break;
                                                case "metrics/getEdgeDestSeries":
                                                case "metrics/getEdgeDeviceSeries":
                                                    timestamp = new Date(dir.startTime).getTime();
                                                    typeval = type.name;
                                                    break;
                                        }
                                        for (const [_ , val] of Object.entries(dir.data)) {
                                            items.push([
                                                timestamp,
                                                typeval,
                                                dir.metric,
                                                val
                                            ]) 
                                            timestamp += dir.tickInterval;
                                        }
                                    }
                                }
                                // sending it to content script to handle the chrome.local.storage, so popup.js can fetch it.  
                                window.postMessage(JSON.stringify({
                                    "type" :name,
                                    "date" :localISOTime,
                                    "value":items
                                })); 
                            }                  
                        }
                    } catch(err) {
                        console.log("Error in responseType try catch");
                        console.log(err);
                    }
                }

            }
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);
