(function() {

var ws = window.WebSocket;

window.WebSocket = function (a, b) {
   var that = b ? new ws(a, b) : new ws(a);
   //that.addEventListener("open", console.info.bind(console, "socket open"));
   //that.addEventListener("close", console.info.bind(console, "socket close"));
   that.addEventListener("message", function (resp) {
        const msg = JSON.parse(resp.data);
        /*
        if (msg.action == "listDiagnostics") {
            window.postMessage(JSON.stringify({
                "api" :"listDiagnostics",
                "resp":msg.data
            }));    
        }
        */
        if (msg.action == "runDiagnostics") {
            switch(msg.data.name) {
                case "FLOW_DUMP":
                case "ROUTE_DUMP":
                case "ROUTES_DETAIL":
                case "BGP_VIEW":
                case "BGP_REDIS_DUMP":
                case "PATHS_DUMP":
                    window.postMessage(JSON.stringify({
                        "api" :msg.data.name,
                        "resp":msg.data.results.output
                    }));    
                    break;
            }
        }
   });
   return that;
};

for (var key in ws) { 
    if (ws.hasOwnProperty(key)) { 
        window.WebSocket[key] = ws[key]; 
    } 
}

})();
