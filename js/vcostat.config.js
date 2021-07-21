function getDateTime (timestamp) {
    const dateAndTime = new Date(timestamp).toISOString().split('T')
    const time = dateAndTime[1].split(':');
    return dateAndTime[0]+' '+time[0]+':'+time[1];
}

var config = {};

/* Config CWS */
config["api/cws/logs"] = {
    css_class: "CWS",
    name: "Web Logs",
    type: "csv",
    setname: function () {
         for (var key in config) {
            if (typeof config[key] == 'object') {
                if (config[key].name == this.name && config[key].css_class == this.css_class) {
                     var parts = key.split("/");
                     var name = parts.pop().split("?")[0];
                     name = name.replace(/([A-Z])/g, ' $1').trim();
                     name = name.charAt(0).toUpperCase() + name.slice(1);
                     this.name = name;
                }
            }
         }
    },
    csv: function (resp=this.resp) {
        var items = []; 
        var header =  [];

        if (!resp) {
            return items;
        }
        if (resp.hasOwnProperty("data")){
            var data = resp.data;
        } else {
            var data = resp[0].result;
        }
        if (data.length <= 0 ) {
            return items;
        }
        for (var [key, _] of Object.entries(data[0])){
            key = key.replace(/([A-Z])/g, ' $1').trim();
            key = key.charAt(0).toUpperCase() + key.slice(1);
            header.push(key);
        }
 
        items.push(header); 

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
        return items;
    }
};

config["api/cws/topUsers"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/topUsers"].setname();

config["api/cws/topSites"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/topSites"].setname();

config["api/cws/actionsSummary"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/actionsSummary"].setname();

config["api/cws/topCategories"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/topCategories"].setname();

config["api/cws/threatOrigins"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/threatOrigins"].setname();

config["api/cws/threatTypes"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/threatTypes"].setname();

config["api/cws/threatsByUsers"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/threatsByUsers"].setname();

config["api/cws/vulnerableServices"] = Object.assign({},config["api/cws/logs"]);
config["api/cws/vulnerableServices"].setname();

/* Config Monitor */

config ["metrics/getEdgeLinkSeries/Transport"] = {
    css_class: "Monitor",
    name: "Transport (Upper)",
    type: "csv",
    _asc: function(arr) {
        return arr.sort((a, b) => a - b);
    },
    _sum: function(arr) {
        return arr.reduce((a, b) => a + b, 0);
    },
    _mean: function(arr) {
        return this._sum(arr) / arr.length;
    },
    _std: function(arr) {
        const mu = this._mean(arr);
        const diffArr = arr.map(a => (a - mu) ** 2);
        return Math.sqrt(this._sum(diffArr) / (arr.length - 1));
    },
    _round: function(value, precision) {
        const multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    },
    _quantile: function(arr, q) {
        const sorted = this._asc(arr);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return this._round(sorted[base] + rest * (sorted[base + 1] - sorted[base]),1);
        } else {
            return this._round(sorted[base],1);
        }
    },
    regression: true,
    csv_header: ["Timestamp (UTC)", "Interface", "Metric", "Data", "*Average", "*Standard Deviation", "*Quantile .95", "*Quantile .75", "*Median (Quantile .50)", "*Quantitle .25", "*Capacity Trendline Calculated Value", "*Capacity Trendline R Squared Value (higher value better)","All values with * are computed within the extension and not coming from API"],
    /* TODO: Build a regression object
    reg_math: {
        _reg: null,
        _poly_getvalue: function (x) {
            var data = 0;
            if (!this._reg) {
                return null;
            }
            for (var i=0; i<this._reg.length; i++) {
                data += this._reg.equation[i] * Math.pow(x, i);
            }
            return data;
        },
        _linear_getvalue: function (x) {
            if (!this._reg) {
                return null;
            }
            return (this._reg.equation[0] * x + this._reg.equation[1]);
        },
        _log_getvalue: function (x) {
            if (!this._reg) {
                return null;
            }   
            return (this._reg.equation[0] + this._reg.equation[1] * Math.log(x));
        },
        _poly_setdata: function (data, order){
            this._reg = regression("polynomial", data, order);
        },
        _other_setdata: function (str, data){
            this._reg = regression(str, data);    
        },
        _getr2: function () {
            if (!this._reg) {
                return null;
            }
            return this._reg.r2.toFixed(3); 
        },
        "polynomial_3": {
            setdata: function (data) {
                .reg_math._poly_setdata(data, 3);
            },
            getvalue: function(x) {
                return reg_math._poly_getvalue(x);  
            },
            getr2: function(x) {
                return reg_math._getr2();  
            }                  
        },
        "polynomial_2": {
            setdata: function (data) {
                reg_math._poly_setdata(data, 2);
            },
            getvalue: function(x) {
                return reg_math._poly_getvalue(x);  
            },
            getr2: function(x) {
                return reg_math._getr2();  
            }                  
        },
        "linear": {
            setdata: function(data) {
                reg_math._other_setdata("linear", data);
            },
            getvalue: function(x) {
                return reg_math._linear_getvalue(x);
            },
            getr2: function() {
                return reg_math._getr2();  
            }
        },
        "logarithmic": {
            setdata: function(data) {
                reg_math._other_setdata("logarithmic", data);
            },
            getvalue: function(x) {
                return reg_math._log_getvalue(x);
            },
            getr2: function() {
                return reg_math._getr2();  
            }
        } 
    },
    */
    csv: function (setup, resp=this.resp) {
        var items = [];

        if (this.csv_header){
            items.push(this.csv_header);
        }

        var reg = false;
        var reg_type;
        var reg_time;
        if (setup) {
            var reg_type = setup.find("#reg_type").val();
            if (reg_type != "none"){
                var reg_time = setup.find("#reg_time").val();
                if (reg_time != "none") {
                    reg = true;
                }
            }
        }

        for (const [_, type] of Object.entries(resp.result)) {
            for (const [_, dir] of Object.entries(type.series)) {
                //dir.data = dir.data.map(i => this._round(i/ (1000 * 1000), 2));
                const cp_data = [...dir.data];
                var mean      = this._round(this._mean(cp_data));
                var std       = this._round(this._std(cp_data));
                var q95       = this._quantile(cp_data, .95);
                var q75       = this._quantile(cp_data, .75);
                var median    = this._quantile(cp_data, .50); 
                var q25       = this._quantile(cp_data, .25);
                var timestamp = dir.startTime;
                if (reg) {
                    var reg_data = [];
                    for (const [_ , val] of Object.entries(dir.data)) {
                          reg_data.push([timestamp, val]);
                          timestamp += dir.tickInterval;
                    }
                    //this.reg_math[reg_type].setdata(reg_data);
                    var math;
                    switch (reg_type) {
                        case "polynomial_3":
                        case "polynomial_2":
                            var [str, order] = reg_type.split("_"); 
                            var math = regression(str, reg_data, parseInt(order));
                            break;
                        case "linear": 
                        case "logarithmic": 
                            var math = regression(reg_type, reg_data);
                            break;
                    }
                }
                timestamp = dir.startTime;
                for (const [_ , val] of Object.entries(dir.data)) {
                    var reg_value = null;
                    //reg_value = this.reg_math[reg_type].getvalue(timestamp);
                    if (reg && math) {
                        switch (reg_type) {
                            case "polynomial_3":
                                reg_value = math.equation[3] * Math.pow(timestamp,3) + math.equation[2] * Math.pow(timestamp,2) + math.equation[1] * timestamp + math.equation[0];
                                break;
                            case "polynomial_2":
                                reg_value = math.equation[2] * Math.pow(timestamp,2) + math.equation[1] * timestamp + math.equation[0];
                                break;
                            case "logarithmic":
                                reg_value = math.equation[0] + math.equation[1] * Math.log(timestamp);
                                break; 
                            case "linear":
                                reg_value = math.equation[0] * timestamp + math.equation[1]; 
                                break;
                        } 

                        items.push([ getDateTime(timestamp), type.link.interface, dir.metric, val, mean, std, q95, q75, median, q25, reg_value, math.r2.toFixed(3)]); 
                    }else{
                        items.push([ getDateTime(timestamp), type.link.interface, dir.metric, val, mean, std, q95, q75, median, q25, "",""]); 
                    }
                    // items.push([ timestamp, type.link.interface, dir.metric, val, mean, std, q95, q75, median, q25, reg_value, this.reg_math[reg_type].getr2()]); 
                    timestamp += dir.tickInterval;
                }
                if (reg && math) {
                      var result = new Date(timestamp);
                      var future_date = result.setDate(result.getDate() + parseInt(reg_time));
                      while (timestamp < future_date) {
                            //reg_value = this.reg_math[reg_type].getvalue(timestamp);
                            switch (reg_type) {
                                case "polynomial_3":
                                    reg_value = math.equation[3] * Math.pow(timestamp,3) + math.equation[2] * Math.pow(timestamp,2) + math.equation[1] * timestamp + math.equation[0];
                                    break;
                                case "polynomial_2":
                                    reg_value = math.equation[2] * Math.pow(timestamp,2) + math.equation[1] * timestamp + math.equation[0];
                                    break;
                                case "logarithmic":
                                    reg_value = math.equation[0] + math.equation[1] * Math.log(timestamp);
                                    break; 
                                case "linear":
                                    reg_value = math.equation[0] * timestamp + math.equation[1]; 
                                    break;
                            }
                            items.push([getDateTime(timestamp), type.link.interface, dir.metric,"","","","","","","",reg_value,math.r2.toFixed(3)]);
                            //items.push([getDateTime(timestamp), type.link.interface, dir.metric,"","","","","","","",reg_value, this.reg_math[reg_type].getr2()]);
                            timestamp += dir.tickInterval
                      } 
                }
            }
        }
        /*
        if (reg && math) {
            var header = items[0];
            header[header.length - 2] = header[header.length - 2] + " ("+ math.string+") r2="+math.r2.toFixed(3);
        }
        */
        return items;
    }
}


config["metrics/getEdgeAppMetrics"] = Object.assign({}, config["metrics/getEdgeLinkSeries/Transport"]);
config["metrics/getEdgeAppMetrics"].name = "Transport (Lower)";
config["metrics/getEdgeAppMetrics"].csv_header = [];
config["metrics/getEdgeAppMetrics"].regression = false;
config["metrics/getEdgeAppMetrics"].csv = function (resp=this.resp) {
        var items = [];
        var header = [];
        var sumint = {};

        for (var [key, _] of Object.entries(resp.result[0])){
            if (key == "linkId") {
                key = "Display Name";
            } else if (key == "name") {
                key = "Application Id";
            } else {
                key = key.replace(/([A-Z])/g, ' $1').trim();
                key = key.charAt(0).toUpperCase() + key.slice(1);
            }
            header.push(key);
        }
        header.push("*Total Bytes per Interface");
        header.push("*Percentage Used per App on Interface (%)");
        header.push("All values with * are computed within the extension and not coming from API");

        items.push(header);

        for (const [_, arr] of Object.entries(resp.result)) {
            if (!sumint.hasOwnProperty(arr.linkId)) {
                sumint[arr.linkId] = 0;
            }
            sumint[arr.linkId] += arr.totalBytes;
        }

        for (const [_, arr] of Object.entries(resp.result)) {
            var data = [];
            if (arr.totalBytes == 0){
                continue;
            }
            for (var [key, val] of Object.entries(arr)) {
                if (key == "application") {
                    val = enums.Application[val] || val;
                }else if (key == "linkId") {
                    val = config["edge/getEdge"].getlinkfromid(val) || val;
                }
                if (key == "serviceGroups") {
                    val = val[0];
                }
                data.push(val);
            }
            var percentage = this._round((arr.totalBytes / sumint[arr.linkId]) * 100, 2);
            data.push(sumint[arr.linkId]);
            data.push(percentage);
            items.push(data);
        } 

        return items;
};

config["metrics/getEdgeLinkSeries/Business"] = Object.assign({}, config["metrics/getEdgeLinkSeries/Transport"]);
config["metrics/getEdgeLinkSeries/Business"].name = "Business Priority";

config ["configuration/getRoutableApplications"] = {
    type: "db",
    resp: {},
    getapp: function (id) {
        if (jQuery.isEmptyObject(this.resp)){
            return false;
        }

        for (const [_, app] of Object.entries(this.resp.result.applications)){
            if (app.id == id) {
                return app.displayName;
            }
        }
        return false;
    },
}


config ["edge/getEdge"] = {
    type: "db",
    resp: {},
    getlinkfromuuid: function (uuid) {
        if (jQuery.isEmptyObject(this.resp)){
            return false;
        }

        for (const [_, link] of Object.entries(this.resp.result.recentLinks)){
            if (link.internalId == uuid) {
                return link.displayName;
            }
        }
        return false;
    },
    getlinkfromid: function (id) {
        if (jQuery.isEmptyObject(this.resp)){
            return false;
        }

        for (const [_, link] of Object.entries(this.resp.result.recentLinks)){
            if (link.id == id) {
                return link.displayName;
            }
        }
        return false;
    }

}

config ["metrics/getEdgeAppSeries"] = {
    css_class: "Monitor",
    name: "Applications",
    type: "csv",
    csv_header:["Timestamp", "Application ID", "Metric", "Data"],    
    csv: function (resp=this.resp) {
        var items = [];

        if (this.csv_header){
            items.push(this.csv_header);
        }
        for (const [_, type] of Object.entries(resp.result)) {
            for (const [_, dir] of Object.entries(type.series)) {
                var timestamp = new Date(dir.startTime).getTime();
                for (const [_ , val] of Object.entries(dir.data)) {
                    items.push([getDateTime(timestamp), enums.Application[type.name] || config["configuration/getRoutableApplications"].getapp(type.name) || type.name, dir.metric, val]); 
                    timestamp += dir.tickInterval;
                }
            }
        }
        return items;
    }
}

config ["metrics/getEdgeDestSeries"] = {
    css_class: "Monitor",
    name: "Destinations",
    type: "csv",
    csv_header: ["Timestamp", "Destination", "Metric", "Data"],    
    csv: function (resp=this.resp) {
        var items = [];

        if (this.csv_header){
            items.push(this.csv_header);
        }
        for (const [_, type] of Object.entries(resp.result)) {
            for (const [_, dir] of Object.entries(type.series)) {
                var timestamp = new Date(dir.startTime).getTime();
                for (const [_ , val] of Object.entries(dir.data)) {
                    items.push([getDateTime(timestamp), type.name , dir.metric, val]); 
                    timestamp += dir.tickInterval;
                }
            }
        }
        return items;
    }
}

config["metrics/getEdgeDeviceSeries"] = Object.assign({},config["metrics/getEdgeDestSeries"]);
config["metrics/getEdgeDeviceSeries"].csv_header[1] = "MAC Address";
config["metrics/getEdgeDeviceSeries"].name = "Sources";

config ["metrics/getEdgeStatusSeries"] = {
    css_class: "Monitor",
    name: "Systems",
    type: "csv",
    csv_header: ["Timestamp", "Metric", "Data (5 minute average)"],    
    csv: function (resp=this.resp) {
        var items = [];

        if (this.csv_header){
            items.push(this.csv_header);
        }

        for (const [_, arr] of Object.entries(resp.result.series)) {
            const timestamp = new Date(arr.startTime).getTime(); 
                for (const [metric, data] of Object.entries(arr)) {
                    if ( metric != "startTime" && metric != "endTime"){
                        items.push([getDateTime(timestamp), metric, data]);
                    }
                }
        }

        return items;
    }
}

config ["edge/getEdgeSDWANPeers"] = {
    css_class: "Monitor",
    name: "Paths",
    type: "csv",
    csv_header: ["Peer Name", "Peer Type", "No. paths in dead", "No. paths in stable", "No. paths in standby", "No. paths in unknown", "No. paths in unstable", "Total Paths", "After Voice QoE", "After Video QoE", "After Trans QoE", "Path QoE"],
    csv: function (resp=this.resp) {
        var items = [];

        if (!resp.result.data) {
            return items;    
        }

        if (this.csv_header){
            items.push(this.csv_header);
        }

        for (const [_, val] of Object.entries(resp.result.data)) {
            items.push([val.peerName, val.peerType, val.pathStatusCount.dead,val.pathStatusCount.stable, val.pathStatusCount.standby, val.pathStatusCount.unknown, val.pathStatusCount.unstable, val.pathStatusCount.total, val.scoreAfterVoice, val.scoreAfterVideo, val.scoreAfterTrans, val.pathQoe]); 
        }

        return items;
    }
}

config ["linkQualityEvent/getLinkQualityEvents"] = {
    css_class: "Monitor",
    name: "QoE",
    type: "csv",
    csv_header: ["Timestamp", "Link", "Jitter tx (ms)", "Jitter rx (ms)", "Latency tx (ms)", "Latency rx (ms)", "Packet loss (%) Tx", "Packet loss (%) Rx", "Voice QoE", "Video QoE", "Transactional QoE"],
    csv: function (resp=this.resp) {
        var items = [];

        if (!resp) {
            return items;    
        }

        if (this.csv_header){
            items.push(this.csv_header);
        }

        for (const [key, type] of Object.entries(resp.result)) {
            for (const [_, data] of Object.entries(type.timeseries)) {
                var timestamp = data.timestamp;
                var jittertx, jitterrx, latencytx, latencyrx, pckttx, pcktrx, aqoe, vqoe, tqoe = null;
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
                
                items.push([getDateTime(timestamp), config["edge/getEdge"].getlinkfromuuid(key) || key,jittertx,jitterrx,latencytx,latencyrx,pckttx,pcktrx,aqoe,vqoe,tqoe]); 
           }
        }

        return items;
    }
}
/* Config Remote Diag */

config ["listDiagnostics"] = {
    type: "db",
    resp: {},
    getdesc: function (name) {
       if (this.resp.hasOwnProperty(name)) {
            return resp[name].label;
       }
       return name;
    }
}

config ["FLOW_DUMP"] = {
    css_class: "RD",
    name: "List Active Flows",
    type: "csv",
    setname: function () {
         for (var key in config) {
            if (typeof config[key] == 'object') {
                if (config[key].name == this.name && config[key].css_class == this.css_class) {
                     this.name = config["listDiagnostics"].getdesc(key)
                }
            }
         }
    },
    csv: function (resp=this.resp) {
        var items = []; 
        if (!resp) {
            return items;
        }
        var obj = $(resp);
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
    },
};

config["ROUTE_DUMP"] = Object.assign({},config["FLOW_DUMP"]);
//config["ROUTE_DUMP"].setname();
config["ROUTE_DUMP"].name = "Route Table Dump";


config["ROUTE_DETAIL"] = Object.assign({},config["FLOW_DUMP"]);
//config["ROUTE_DETAIL"].setname();
config["ROUTE_DETAIL"].name = "List Routes per Prefix";

config["BGP_VIEW"] = Object.assign({},config["FLOW_DUMP"]);
//config["BGP_VIEW"].setname();
config["BGP_VIEW"].name = "List BGP Routes";

config["BGP_REDIS_DUMP"] = Object.assign({},config["FLOW_DUMP"]);
//config["BGP_REDIS_DUMP"].setname();
config["BGP_REDIS_DUMP"].name = "List BGP Redistributed Routes";

config["PATHS_DUMP"] = Object.assign({},config["FLOW_DUMP"]);
//config["PATHS_DUMP"].setname();
config["PATHS_DUMP"].name = "List Paths";

console.log(config);
