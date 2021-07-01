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

                        var req = {};
                        var resp = {};
                        var items = [];
                        var name = "";
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
                                    req["method"] = "api/cws/logs";
                                    resp = JSON.parse(arr);
                                    break;
                                case cws_topusers.test(myUrl):
                                case cws_topsites.test(myUrl):
                                case cws_as.test(myUrl):
                                case cws_topcat.test(myUrl):
                                case cws_threato.test(myUrl):
                                case cws_threatt.test(myUrl):
                                case cws_threatbyu.test(myUrl):
                                case cws_vs.test(myUrl):
                                    req["method"] = "api/cws/threat&traffic";
                                    var parts = myUrl.split("/");
                                    name = parts.pop().split("?")[0];
                                    name = name.replace(/([A-Z])/g, ' $1').trim();
                                    name = name.charAt(0).toUpperCase() + name.slice(1);
                                    resp = JSON.parse(arr);
                                    break;
                            }
                        // old and new API v2 POST requests are used
                        }else if (this._method == "POST") {
                            req = JSON.parse(this._requestHeaders);
                            resp = JSON.parse(arr);
                        }
                        if (req.hasOwnProperty('method')){ 
                            //var req = JSON.parse(this._requestHeaders);
                            //var resp = JSON.parse(arr);
                            //console.log(req);
                            //console.log(resp);

                            if (req.method == 'api/cws/logs'               ||
                                req.method == 'api/cws/threat&traffic'  ||
                                req.method == 'metrics/getEdgeLinkSeries'  ||
                                req.method == 'metrics/getEdgeAppSeries'   ||
                                req.method == 'metrics/getEdgeDeviceSeries'||
                                req.method == 'metrics/getEdgeDestSeries'  ||
                                req.method == 'metrics/getEdgeStatusSeries'||
                                req.method == 'edge/getEdgeSDWANPeers'     ||
                                req.method == 'linkQualityEvent/getLinkQualityEvents'
                            ){

                                // adding the headers of the CSV as first entry in the array
                                switch(req.method){
                                    // TODO: there is no good way to figure out the difference between Transport or Business Priority (same API). Hence sending it to the same row in popup.html.
                                    case "api/cws/threat&traffic":
                                    case "api/cws/logs": 
                                          if (req.method == "api/cws/logs") {
                                            var keys = resp.data[0];
                                            name = "Web Logs";
                                          } else {
                                            var keys = resp[0].result[0];
                                          }
                                          if (keys) {
                                             var header = [];
                                             for (var [key, _] of Object.entries(keys)){
                                                key = key.replace(/([A-Z])/g, ' $1').trim();
                                                key = key.charAt(0).toUpperCase() + key.slice(1);
                                                header.push(key);
                                             }; 
                                             items.push(header); 
                                          }
                                          break;
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
                                    case "linkQualityEvent/getLinkQualityEvents":
                                          items.push(["Timestamp", "Interface UUID", "Jitter tx (ms)", "Jitter rx (ms)", "Latency tx (ms)", "Latency rx (ms)", "Packet loss (%) Tx", "Packet loss (%) Rx", "Voice QoE", "Video QoE", "Transactional QoE"]);
                                          name = "QoE";
                                          break;
                                    case "metrics/getEdgeStatusSeries":
                                          items.push(["Timestamp", "Metric", "Data (5 min avg)"]);
                                          name = "Systems";
                                          break;
                                    case "edge/getEdgeSDWANPeers":
                                          items.push(["Peer Name", "Peer Type", "No. paths in dead", "No. paths in stable", "No. paths in standby", "No. paths in unknown", "No. paths in unstable", "Total Paths", "After Voice QoE", "After Video QoE", "After Trans QoE", "Path QoE"])
                                          name = "Paths";
                                          break;
         
                                }
                                // going through Object (from JSON) to get relevant pieces
                        
                                if (req.method == "api/cws/logs" || req.method == "api/cws/threat&traffic") {
                                    if (req.method == "api/cws/logs") {
                                        var data = resp.data; 
                                    } else {
                                        var data = resp[0].result;
                                    }
                                    for (const [_, arr] of Object.entries(data)) {
                                        var values = [];
                                        for (const [_, value] of Object.entries(arr)) {
                                            if (Array.isArray(value)){
                                               values.push(value.join("|"));
                                            } else {
                                               values.push(value);
                                            }
                                        }
                                        items.push(values);
                                    }
                                } else if (req.method == "linkQualityEvent/getLinkQualityEvents") {
                                    for (const [key, type] of Object.entries(resp.result)) {
                                        for (const [_, data] of Object.entries(type.timeseries)) {
                                            var timestamp = data.timestamp;
                                            var inter = key;
                                            var jittertx = null;
                                            var jitterrx = null;
                                            var latencytx = null;
                                            var latencyrx = null;
                                            var pckttx = null;
                                            var pcktrx = null;
                                            var aqoe   = null;
                                            var vqoe   = null;
                                            var tqoe   = null;
                                            if (data.metadata.detail){
                                                var detail = data.metadata.detail;
                                                jitterrx = detail.jitterMsRx;    
                                                jittertx = detail.jitterMsTx;
                                                latencyrx = detail.latencyMsRx;
                                                latencytx = detail.latencyMsTx;
                                                pcktrx = detail.lossPctRx;
                                                pckttx = detail.lossPctTx
                                            }
                                            if (data.score) {
                                                aqoe  = data.score[0];
                                                vqoe  = data.score[1];
                                                tqoe  = data.score[2];
                                            }
                                            
                                            items.push([timestamp,inter,jittertx,jitterrx,latencytx,latencyrx,pckttx,pcktrx,aqoe,vqoe,tqoe]); 

                                        }
                                    }
                                 } else if (req.method == "metrics/getEdgeStatusSeries"){
                                    for (const [_, arr] of Object.entries(resp.result.series)) {
                                        var timestamp = new Date(arr.startTime).getTime(); 
                                        for (const [metric, data] of Object.entries(arr)) {
                                            if ( metric != "startTime" && metric != "endTime"){
                                                items.push([timestamp, metric, data]);
                                            }
                                        }
                                    }
                                 } else if (req.method == "edge/getEdgeSDWANPeers") {
                                    if (resp.result.data){
                                        for (const [_, val] of Object.entries(resp.result.data)) {
                                           items.push([
                                                val.peerName,
                                                val.peerType,
                                                val.pathStatusCount.dead,
                                                val.pathStatusCount.stable,
                                                val.pathStatusCount.standby,
                                                val.pathStatusCount.unknown,
                                                val.pathStatusCount.unstable,
                                                val.pathStatusCount.total,
                                                val.scoreAfterVoice,
                                                val.scoreAfterVideo,
                                                val.scoreAfterTrans,
                                                val.pathQoe
                                           ]); 
                                        }
                                    }
                                 } else {
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
                                }
                                // sending it to content script to handle the chrome.local.storage, so popup.js can fetch it.  
                                window.postMessage(JSON.stringify({
                                    "type" :name,
                                    "value":items
                                })); 
                         }
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
