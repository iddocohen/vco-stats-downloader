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

            //var myUrl = this._url ? this._url.toLowerCase() : this._url;
            var myUrl = this._url;
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
                        var api = "";
                        var type = "csv";
                        // new API v2 GET requests are used as well for VCO API
                        if (this._method == "GET") {
                            var cws_logs        = /\/api\/cws\/.*\/logs/;
                            var cws_topusers    = /\/api\/cws\/.*\/topUsers/; 
                            var cws_topsites    = /\/api\/cws\/.*\/topSites/; 
                            var cws_as          = /\/api\/cws\/.*\/actionsSummary/; 
                            var cws_topcat      = /\/api\/cws\/.*\/topCategories/; 
                            var cws_threato     = /\/api\/cws\/.*\/threatOrigins/;
                            var cws_threatt     = /\/api\/cws\/.*\/threatTypes/;
                            var cws_threatbyu   = /\/api\/cws\/.*\/threatsByUsers/;
                            var cws_vs          = /\/api\/cws\/.*\/vulnerableServices/;
                            switch (true) {
                                case cws_logs.test(myUrl):
                                    api = "api/cws/logs";
                                    break;
                                case cws_topusers.test(myUrl):
                                    api = "api/cws/topUsers";
                                    break;
                                case cws_topsites.test(myUrl):
                                    api = "api/cws/topSites";
                                    break;
                                case cws_as.test(myUrl):
                                    api = "api/cws/actionsSummary";
                                    break;
                                case cws_topcat.test(myUrl):
                                    api = "api/cws/topCategories";
                                    break;
                                case cws_threato.test(myUrl):
                                    api = "api/cws/threatOrigins";
                                    break;
                                case cws_threatt.test(myUrl):
                                    api = "api/cws/threatTypes";
                                    break;
                                case cws_threatbyu.test(myUrl):
                                    api = "api/cws/threatsByUsers";
                                    break;
                                case cws_vs.test(myUrl):
                                    api = "api/cws/vulnerableServices";
                                    break;
                            }
                        // old and new API v2 POST requests are used
                        }else if (this._method == "POST") {
                            req = JSON.parse(this._requestHeaders);
                            switch (req.method) {
                                case "metrics/getEdgeLinkSeries":
                                    if (req.params.metrics[0].includes("p1")) {
                                        api = req.method+"/Business";
                                    } else {
                                        api = req.method+"/Transport";
                                    }
                                    break;
                                case "metrics/getEdgeAppSeries":
                                case "metrics/getEdgeDeviceSeries":
                                case "metrics/getEdgeDestSeries":
                                case "metrics/getEdgeStatusSeries":
                                case "edge/getEdgeSDWANPeers":
                                case "linkQualityEvent/getLinkQualityEvents":
                                case "edge/getEdge":
                                    type = "db";
                                case "configuration/getRoutableApplications":
                                    type = "db";
                                case "metrics/getEdgeAppMetrics":
                                    api = req.method;
                                    break;

                            }
                        }
                        // sending it to content script to handle the chrome.local.storage, so popup.js can fetch it.  
                        if (api != ""){
                            window.postMessage(JSON.stringify({
                                "api" :api,
                                "type": type,
                                "resp":this.responseText
                            })); 
                        }
                    } catch(err) {
                        console.log(err);
                    }
                }
            }
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest);
