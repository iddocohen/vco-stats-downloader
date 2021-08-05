function getDateTime (timestamp) {
    // Server return UTC, converting it to local timezone like in VCO.
    // Reference: https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const dateAndTime = new Date(timestamp-tzoffset).toISOString().split('T')
    const time = dateAndTime[1].split(':');
    return dateAndTime[0]+' '+time[0]+':'+time[1];
}
function clone (obj) {
    var clone = {};
    for (let k in obj){
        if (obj.hasOwnProperty(k)) {
            clone[k] = obj[k];
        } 
    }
    return clone;
}

function round(number, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(number * multiplier) / multiplier;
}

var reg_math = {
    _poly_getvalue: function (x, reg) {
        if (!reg) {
            return null;
        }
        var data = 0;
        for (let i=0; i < reg.equation.length; i++) {
            data += reg.equation[i] * Math.pow(x, i);
        }
        return round(data,2);
    },
    _linear_getvalue: function (x, reg) {
        if (!reg) {
            return null;
        }
        var data = reg.equation[0] * x + reg.equation[1];
        return round(data,2);
    },
    _log_getvalue: function (x, reg) {
        if (!reg) {
            return null;
        }
        var data = reg.equation[0] + reg.equation[1] * Math.log(x);
        return round(data,2);
    },
    _poly_setdata: function (data, order){
        try {
            return (regression("polynomial", data, order));
        } catch (e){
            return false;
        }
    },
    _other_setdata: function (str, data){
        try {
            return(regression(str,data));    
        } catch {
            return false;
        }
    },
    _getr2: function (reg) {
        if (!reg) {
            return null;
        }
        let val = reg.r2;
        if (isNaN(val)) {
            val = 100;
        } else {
            val = round(parseFloat(val)*100);
        }
        return ((val) ? val : 0); 
    },
    _geteq: function(reg) {
        if (!reg) {
            return "";
        }
        return reg.string;
    }
};

var reg_option = {};
reg_option["polynomial_3"] = {
    _reg: null,
    setdata: function (data) {
       this._reg = reg_math._poly_setdata(data, 3);
       if (this._reg) {
            return true;
       }
       return false;
    },
    getvalue: function(x) {
       return reg_math._poly_getvalue(x, this._reg);  
    },
    getr2: function() {
       return reg_math._getr2(this._reg);  
    },
    geteq: function () {
       return reg_math._geteq(this._reg);
    }                  
    
};
reg_option["polynomial_2"] = {
    _reg: null,
    setdata: function (data) {
        this._reg = reg_math._poly_setdata(data, 2);
        if (this._reg) {
            return true;
        }
        return false;
    },
    getvalue: function(x) {
        return reg_math._poly_getvalue(x, this._reg);  
    },
    getr2: function() {
        return reg_math._getr2(this._reg);  
    },
    geteq: function () {
       return reg_math._geteq(this._reg);
    }                  
};                  
reg_option["linear"] = {
    _reg: null,
    setdata: function(data) {
        this._reg = reg_math._other_setdata("linear", data);
        if(this._reg) {
            return true;
        }
        return false;
    },
    getvalue: function(x) {
        return reg_math._linear_getvalue(x, this._reg);
    },
    getr2: function() {
        return reg_math._getr2(this._reg);  
    },
    geteq: function () {
       return reg_math._geteq(this._reg);
    }                  
};
reg_option["logarithmic"] = {
    _reg: null,
    setdata: function(data) {
        this._reg = reg_math._other_setdata("logarithmic", data);
        if(this._reg) {
            return true;
        }
        return false;
    },
    getvalue: function(x) {
        return reg_math._log_getvalue(x, this._reg);
    },
    getr2: function() {
        return reg_math._getr2(this._reg);  
    },
    geteq: function () {
       return reg_math._geteq(this._reg);
    }                  
};

//TODO: So inefficient that I cannot use it on large datasets (aka Systems with 31 days average). So removing it

reg_option["best"] = {
    _name: "",
    _data: [],
    setdata: function (data) {
        let r2 = -1;
        for (const [k, _] of Object.entries(reg_option)) {
            if (k === "best") {
                continue;
            }
            if (r2 == 100) {
                continue;
            }
            if (reg_option[k].setdata(data)) {
                let t = reg_option[k].getr2();      
                if (t > r2 || t == 100) {
                    this._name = k;
                    this._data = data;
                    r2 = t;
                    
                }
            }else {
                console.log("Fuck");
            }
        }     
    }, 
    getvalue: function(x) {
        reg_option[this._name].setdata(this._data);
        return reg_option[this._name].getvalue(x);
    },
    getr2: function () {
        return reg_option[this._name].getr2();
    },
    geteq: function () {
        return reg_option[this._name].geteq();
    }                  
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
    _quantile: function(arr, q) {
        const sorted = this._asc(arr);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return round(sorted[base] + rest * (sorted[base + 1] - sorted[base]),1);
        } else {
            return round(sorted[base],1);
        }
    },
    regression: true,
    draw: {
        title: "Transport", 
        pointStart: 0,
        pointInterval: 0, 
        table: {
            Name: {
                dropdown: {}
            },
            Metric: {
                dropdown: {}
            }
        }
    },
    csv_header: ["Timestamp", "Name", "Metric", "Data", "*Average", "*Standard Deviation", "*Quantile .95", "*Quantile .75", "*Median (Quantile .50)", "*Quantitle .25", "*Capacity Trendline Calculated Value", "*Success in Calculating Trendline (%)", "All values with * are computed within the extension and not coming from API"],
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
            let bpsRx = [];
            let bpsTx = [];
            for (let i = type.series.length; i--;) {
                if (type.series[i].metric === "bpsOfBestPathTx"){
                    bpsTx = [...type.series[i].data];
                    type.series.splice(i, 1);
                }
            }
            for (let i = type.series.length; i--;) {
                if (type.series[i].metric === "bpsOfBestPathRx"){
                    bpsRx = [...type.series[i].data];
                    type.series.splice(i, 1);
                }
            }
            // API returns several bytesRx as this is getting requested by the UI. Not sure why the UI asks for it. Hence deleting one and only when bpsOfBestPathRx is set.
            if (bpsRx.length > 0){
                let foundRx = null;
                for (let i=0; i < type.series.length; i++) {
                    if (type.series[i].metric === "bytesRx"){
                        foundRx = i;
                    }
                }
                if (foundRx) {
                    type.series.splice(foundRx,1);
                }
            }
            
            for (let j = 0; j < type.series.length; j++) {
                let dir = type.series[j];
                if (j == 0) {
                    // For drawing in HighStock it is easier to use start point and interval. Converting it also to local timezone.
                    this.draw.pointStart = dir.startTime - ((new Date()).getTimezoneOffset() * 60000);
                    this.draw.pointInterval = dir.tickInterval;
                }
                if (bpsRx.length > 0 || bpsTx.length > 0) {
                    dir.data = dir.data.map(x => ((x*8*1000)/dir.tickInterval));
                    dir.metric = dir.metric.replace("bytes", "bitsPerSecond");
                }

                this.draw.table.Name.dropdown[type.link.displayName] = type.link.displayName;
                this.draw.table.Metric.dropdown[dir.metric] = dir.metric; 

                const cp_data = [...dir.data];
                var mean      = round(this._mean(cp_data));
                var std       = round(this._std(cp_data));
                var q95       = this._quantile(cp_data, .95);
                var q75       = this._quantile(cp_data, .75);
                var median    = this._quantile(cp_data, .50); 
                var q25       = this._quantile(cp_data, .25);
                const IQR     = q75 - q25;
                var timestamp = dir.startTime;
                if (reg) {
                    var reg_data = [];
                    for (let i = 0; i < dir.data.length; i++){
                          var val = dir.data[i];
                          if(val > (q75 + (1.5 * IQR)) || val < (q25 - (1.5 * IQR))) {
                              continue;
                          }
                          reg_data.push([timestamp, val]);
                          timestamp += dir.tickInterval;
                    }
                    reg_option[reg_type].setdata(reg_data);
                }
                timestamp = dir.startTime;
                for (let i = 0; i < dir.data.length; i++){
                    var val = dir.data[i];
                    var reg_value = null;
                    if (reg){
                       reg_value = reg_option[reg_type].getvalue(timestamp);
                       items.push([ getDateTime(timestamp), type.link.displayName, dir.metric, val, mean, std, q95, q75, median, q25, reg_value, reg_option[reg_type].getr2()]); 
                    }else{
                       items.push([ getDateTime(timestamp), type.link.displayName, dir.metric, val, mean, std, q95, q75, median, q25, "",""]); 
                    }
                    timestamp += dir.tickInterval;
                }
                if (reg) {
                      var result = new Date(timestamp);
                      var future_date = result.setDate(result.getDate() + parseInt(reg_time));
                      while (timestamp < future_date) {
                            reg_value = reg_option[reg_type].getvalue(timestamp);
                            items.push([getDateTime(timestamp), type.link.displayName, dir.metric,"","","","","","","",reg_value, reg_option[reg_type].getr2()]);
                            timestamp += dir.tickInterval
                      } 
                }
            }
        }
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
            var percentage = round((arr.totalBytes / sumint[arr.linkId]) * 100, 2);
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
    csv_header: ["Timestamp", "Metric", "Data (5 minute average)", "*Capacity Trendline", "*Success in Calculating Trendline", "All values with * are computed within the extension and not coming from API"],    
    regression: true,
    draw: {
        title: "Systems", 
        pointStart: 0,
        pointInterval: 0, 
        table: {
            Metric: {
                dropdown: {}
            }
        }
    },
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

         if (reg) {
            var systems = {};
            for (const [_, arr] of Object.entries(resp.result.series)) {
                var timestamp = new Date(arr.startTime).getTime(); 
                for (const [metric, data] of Object.entries(arr)) {
                    if ( metric != "startTime" && metric != "endTime"){
                        if (!systems.hasOwnProperty(metric)) {
                            systems[metric] = [];
                        }
                        systems[metric].push([timestamp, data]);
                    }
                }
            }
            var systems_reg = {};
            for (metric in systems) {
                //systems_reg[metric] = Object.assign({},reg_option[reg_type]);
                //systems_reg[metric] = JSON.parse(JSON.stringify(reg_option[reg_type]));
                //systems_reg[metric] = clone(reg_option[reg_type]);
                //systems_reg[metric] = clone(reg_option[reg_type]);
                systems_reg[metric] = {};
                for (let k in reg_option[reg_type]){
                    if (reg_option[reg_type].hasOwnProperty(k)) {
                        systems_reg[metric][k] = reg_option[reg_type][k];
                    } 
                }
                systems_reg[metric].setdata(systems[metric]);
            }
        }
        for (let i = 0; i < resp.result.series.length; i++ ) {
            let arr = resp.result.series[i];
            let timestamp = new Date(arr.startTime).getTime(); 
            if (i == 0) {
                this.draw.pointStart = timestamp; 
            }
            if (i == 1) {
                this.draw.pointInterval = timestamp - this.draw.pointStart;
            }
            for (const [metric, data] of Object.entries(arr)) {
                if (metric != "startTime" && metric != "endTime"){
                    this.draw.table.Metric.dropdown[metric] = metric;
                    if (reg) {
                        items.push([getDateTime(timestamp), metric, data, systems_reg[metric].getvalue(timestamp), systems_reg[metric].getr2()]);    
                    } else { 
                        items.push([getDateTime(timestamp), metric, data, "", ""]);
                    }
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
            //for (const [_, data] of Object.entries(type.timeseries)) {
            for (let i = 0; i < type.timeseries.length; i++) {
                let data = type.timeseries[i];
                var timestamp = data.timestamp;
                // Accomodate the fact that API may produce more samples if requested `maxSamples` is used. This ignores all data with same timestamp
                if (i > 0 && timestamp == type.timeseries[i-1].timestamp) {
                    continue;
                } 
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
