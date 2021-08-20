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

function cuberoot(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}

// Similar to https://stackoverflow.com/questions/27176423/function-to-solve-cubic-equation-analytically but different
function solveCubic2(a, b, c, d) {
    let result = [{r:0, i:0}, {r: 0, i: 0}, {r:0, i:0}];
    if (a === 0) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (a === 0) { // Linear case, ax+b=0
            a = b; b = c;
            if (a === 0) // Degenerate case
                return [];
            result[2].r = -b/a;
            return result;
        }

        const D = b*b - 4*a*c;
        if (D === 0) {
            result[2].r = -b/(2*a);
            return result;
        } else if (D > 0) {
            result[1].r = (-b+Math.sqrt(D))/(2*a);
            result[2].r = (-b-Math.sqrt(D))/(2*a);
            return result;
        }
        return [];
    }
    
    // constants
    const eps = Number.EPSILON;
    const j = b / a;
    const k = c / a;
    const l = d / a;
    const p = -(j * j / 3.0) + k;

    let q = (2.0 / 27.0 * j * j * j) - (j * k / 3.0) + l;
    let t = q * q / 4.0 + p * p * p / 27.0;

    // force to zero if it is very close to zero
    if (Math.abs(t) < eps) {
        t = 0;
    }
    if (Math.abs(q) < eps) {
        q = 0;
    }

    let r1 = 0, r2 = 0, r3 = 0, i1 = 0, i2 = 0, i3 = 0, i;

    // There are three cases according to the value of t
    if (t > 0) {// one real, two complexs
        r1 = cuberoot(-q / 2.0 + Math.sqrt(t)) + cuberoot(-q / 2.0 - Math.sqrt(t));
        // two complex roots
        r2 = -r1 / 2.0;
        r3 = r2; // conjugated
        // imaginary
        if (q == 0) {
            i = Math.sqrt(k);
        } else {
            i = Math.sqrt(Math.abs(Math.pow(r1 / 2.0, 2.0) + q / r1));
        }
        i1 = 0;
        i2 = i;
        i3 = -i;
    } else if (t == 0) {
        r1 = 2.0 * cuberoot(-q / 2.0);
        r2 = -r1 / 2.0 + Math.sqrt(Math.pow(r1 / 2.0, 2.0) + q / r1);
        r3 = -r1 / 2.0 - Math.sqrt(Math.pow(r1 / 2.0, 2.0) + q / r1);
    } else if (t < 0) {
        let x = -q / 2.0;
        let y = Math.sqrt(-t); // make t positive
        let angle = Math.atan(y / x);
        if (q > 0) {// if q > 0 the angle becomes 2 * PI - angle
            angle = Math.PI - angle;
        }
        r1 = 2.0 * Math.sqrt(-p / 3.0) * Math.cos(angle / 3.0);
        r2 = 2.0 * Math.sqrt(-p / 3.0) * Math.cos((angle + 2.0 * Math.PI) / 3.0);
        r3 = 2.0 * Math.sqrt(-p / 3.0) * Math.cos((angle + 4.0 * Math.PI) / 3.0);
    }
    result[0].r = r1 - j / 3.0;
    result[0].i = i1;
    result[1].r = r2 - j / 3.0;
    result[1].i = i2;
    result[2].r= r3 - j / 3.0;
    result[2].i= i3;

    return result;

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
        if (data < 0 ) {
            return 0;
        }
        return round(data,2);
    },
    _linear_getvalue: function (x, reg) {
        if (!reg) {
            return null;
        }
        var data = reg.equation[0] * x + reg.equation[1];
        if (data < 0 ) {
            return 0;
        }
        return round(data,2);
    },
    _log_getvalue: function (x, reg) {
        if (!reg) {
            return null;
        }
        var data = reg.equation[0] + reg.equation[1] * Math.log(x);
        if (data < 0 ) {
            return 0;
        }
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
    },
    _getroots: function (coeff, max) {
        [a,b,c,d] = coeff;
        d = d - max;
        let root = solveCubic2(a,b,c,d);
        console.log(coeff);
        console.log(root);
        if (root.length > 0) {
            return (root[2].i >= 0)?round(root[2].r):0;
        }
        return 0;
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
    },               
    getroots: function(max) {
        let coeff = [...this._reg.equation].reverse();
        return reg_math._getroots(coeff, max); 
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
    },
    getroots: function(max) {
        let coeff = [...this._reg.equation].reverse();
        return reg_math._getroots(coeff, max); 
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
    },
    getroots: function(max) {
        let coeff = [...this._reg.equation];
        coeff.unshift(0);
        coeff.unshift(0);
        return reg_math._getroots(coeff, max); 
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
    },
     getroots: function(max) {
        let coeff = [...this._reg.equation];
        coeff.unshift(0);
        coeff.unshift(0);
        return reg_math._getroots(coeff, max); 
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
        pointEnd: 0,
        edge: "",
        name: "",
        notfication: {
            summary: {
                totalbitsPerSecond_1300:  { str: "Overall edge capacity for 1300 byte packets is %CAP%.  Overall throughput will approx. reach it ", max_capacity: 0, current_value: 0, future_edges: [], type:"bps"},
                totalbitsPerSecond_imix:  { str: "Overall edge capacity for IMIX packets is %CAP%. Overall throughput will approx. reach it ", max_capacity: 0, current_value: 0, future_edges: [], type: "bps"},
                totalbitsPerSecond_64:    { str: "Overall edge capacity for 64 byte packets is %CAP%. Overall throughput will approx. reach it ", max_capacity: 0, current_value: 0, future_edges: [] , type: "bps"},
            }
        },
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

        this.draw.edge   = config["edge/getEdge"].getmodel() || "";
        this.draw.name   = config["edge/getEdge"].getname() || "";

        var reg_type = setup.find("#reg_type").val();
        var reg_time = setup.find("#reg_time").val();

        // Creating a total system statistics and append it to existing result
        let total_systems = {
            link: {
                displayName: "Overall",
            },
            series: []
        };

        let removedBps = false;
        for (const [_, type] of Object.entries(resp.result)) {
            // Removing bpsOfBestPathTx and Rx, as really not needed 
            for (let i = type.series.length; i--;) {
                if (type.series[i].metric === "bpsOfBestPathTx" || type.series[i].metric === "bpsOfBestPathRx"){
                    //bpsTx = [...type.series[i].data];
                    removedBps = true;
                    type.series.splice(i, 1);
                }
            }
            // API returns several bytesRx as this is getting requested by the UI. Not sure why the UI asks for it. Hence deleting one and only when bpsOfBestPathRx is set.
            if (removedBps){
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
 
            for (let i = 0; i < type.series.length; i++) {
                let dir = type.series[i];
                if (total_systems.series[i] === undefined) {
                    total_systems.series.push({});
                    total_systems.series[i] = Object.assign({},dir); 
                    total_systems.series[i].data = [...dir.data];
                    delete total_systems.series[i].max;
                    delete total_systems.series[i].min;
                    delete total_systems.series[i].total;
                    continue;
                } 
                for (let j = 0; j < dir.data.length; j++) {
                    total_systems.series[i].data[j] += dir.data[j];
                }
            }
        }
        // Constructing totalBytes for the systems by searching for all bytesRx and bytesTx in total_systems
        let bytesRx = [];
        let bytesTx = [];
        for (let i = 0; i < total_systems.series.length; i++) {
            if (total_systems.series[i].metric === "bytesRx") {
                bytesRx = [...total_systems.series[i].data];
            }
            if (total_systems.series[i].metric === "bytesTx") {
                bytesTx = [...total_systems.series[i].data];
            }
        }
        // Adding the arrays together and pushing the new metric into total_systems.
        if (bytesRx.length > 0 && bytesRx.length === bytesTx.length) {
            let totalBytes = bytesRx.map(function (num, idx) {
                return num + bytesTx[idx];
            })
            total_systems.series.push({
                metric: "totalbytes",
                data: totalBytes,
                startTime: total_systems.series[0].startTime,
                tickInterval: total_systems.series[0].tickInterval 
            });
        }

        // Pushing the total_systems into the original response
        console.log(total_systems);
        resp.result.push(total_systems);

        for (const [_, type] of Object.entries(resp.result)) {
            for (let j = 0; j < type.series.length; j++) {
                let dir = type.series[j];
                if (j == 0) {
                    // For drawing in HighStock it is easier to use start point and interval. Converting it also to local timezone.
                    this.draw.pointStart = dir.startTime - ((new Date()).getTimezoneOffset() * 60000);
                    this.draw.pointInterval = dir.tickInterval;
                }
                if (removedBps) {
                    dir.data = dir.data.map(x => round(((x*8*1000)/dir.tickInterval)));
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
                if (dir.metric === "totalbitsPerSecond") {
                    let a = ["_1300", "_imix", "_64"];
                    // Get maximum throughput for edge with 1300,imix and 64 bytes packets and calculate when this will be reached
                    for (let x = 0; x < a.length; x++) {
                        let metric = dir.metric.concat(a[x]); 
                        let dict   = dictonary(metric);
                        let max    = dict.max(this.draw.edge);
                        this.draw.notfication.summary[metric].max_capacity   = max;
                        this.draw.notfication.summary[metric].current_value  = reg_option[reg_type].getroots(max);
                        this.draw.notfication.summary[metric].future_edges   = dict.find(this.draw.edge); 
                    }
                }

                timestamp = dir.startTime;
                for (let i = 0; i < dir.data.length; i++){
                    var val = dir.data[i];
                    var reg_value = reg_option[reg_type].getvalue(timestamp);
                    items.push([ getDateTime(timestamp), type.link.displayName, dir.metric, val, mean, std, q95, q75, median, q25, reg_value, reg_option[reg_type].getr2()]); 
                    timestamp += dir.tickInterval;
                }

                this.draw.pointEnd = timestamp;

                var result = new Date(timestamp);
                var future_date = result.setDate(result.getDate() + parseInt(reg_time));

                while (timestamp < future_date) {
                    reg_value = reg_option[reg_type].getvalue(timestamp);
                    items.push([getDateTime(timestamp), type.link.displayName, dir.metric,"","","","","","","",reg_value, reg_option[reg_type].getr2()]);
                    timestamp += dir.tickInterval
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
    },
    getmodel: function() {
        if (jQuery.isEmptyObject(this.resp)){
            return false;
        }

        return this.resp.result.modelNumber;
    },
    getname: function() {
        if (jQuery.isEmptyObject(this.resp)) {
            return false;
        }

        return this.resp.result.name;
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
        pointEnd: 0,
        edge: "",
        name: "",
        notfication: {
            summary: {
                flowCount: { max_capacity: 0, current_value: 0, future_edges: [], type: "count"},
                tunnelCount: { max_capacity: 0, current_value: 0, future_edges: [], type: "count"}
            }
        },
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

        var reg_type = setup.find("#reg_type").val();
        var reg_time = setup.find("#reg_time").val();

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
        var systems_max = {};
        
        this.draw.edge   = config["edge/getEdge"].getmodel() || "";
        this.draw.name   = config["edge/getEdge"].getname() || "";

        for (metric in systems) {
            systems_reg[metric] = Object.assign({},reg_option[reg_type]);
            //systems_reg[metric] = JSON.parse(JSON.stringify(reg_option[reg_type]));
            //systems_reg[metric] = clone(reg_option[reg_type]);
            //systems_reg[metric] = clone(reg_option[reg_type]);
            /* Need to do a better copy for "best" capacity calculation. I cannot find a better way hence disabling it.
            systems_reg[metric] = {};
            for (let k in reg_option[reg_type]){
                if (reg_option[reg_type].hasOwnProperty(k)) {
                    systems_reg[metric][k] = reg_option[reg_type][k];
                } 
            }
            */
            systems_reg[metric].setdata(systems[metric]);
            if (!this.draw.edge) {
                continue;
            }
            if (this.draw.notfication.summary.hasOwnProperty(metric)) {
                let dict = dictonary(metric);
                let max = dict.max(this.draw.edge);
                this.draw.notfication.summary[metric].max_capacity   = max;
                this.draw.notfication.summary[metric].current_value  = systems_reg[metric].getroots(max);
                this.draw.notfication.summary[metric].future_edges   = dict.find(this.draw.edge);
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
                    items.push([getDateTime(timestamp), metric, data, systems_reg[metric].getvalue(timestamp), systems_reg[metric].getr2()]);    
                }
            }
        }

        this.draw.pointEnd = timestamp;

        let result = new Date(timestamp);
        let future_date = result.setDate(result.getDate() + parseInt(reg_time));
        while (timestamp < future_date) {
            for (const [metric, _ ] of Object.entries(systems)) {
                items.push([getDateTime(timestamp), metric, "", systems_reg[metric].getvalue(timestamp), systems_reg[metric].getr2()]);    
            }
            timestamp += this.draw.pointInterval;
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
