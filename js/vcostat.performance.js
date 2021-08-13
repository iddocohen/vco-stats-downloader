/* This are the limits defined based on the VCE datasheets found under vmware.com.

Date of the performance sheet was: 18.03.2021. 

https://wan.velocloud.com/rs/098-RBR-178/images/sdwan-712-edge-platform-spec-ds-1020.pdf

*/

// Exculding 520, 520v, 540, 1000, 1000qe, 2000, 840 series, as end of sales.
let sale_edges = [
    "virtual",
    //"edge500",
    "edge510",
    "edge510-lte",
    //"edge520",
    //"edge520-v",
    //"edge540",
    //"edge540-poe",
    "edge610",
    "edge610-lte",
    "edge620",
    "edge640",
    "edge680",
    //"edge840",
    //"edge2000",
    "edge3400",
    "edge3800",
    "edge3810"
]


//Concurrent flows for type "virtual" is not defined, as it depends on core number. 
function max_concurrent_flows (edge) {
    switch (edge) {
        case "edge510":
        case "edge510-lte":
        case "edge520":
        case "edge520-v":
        case "edge610":
        case "edge610-lte":
            return 240000;
        case "edge540":
        case "edge540-poe":
        case "edge620":
            return 480000;
        case "edge640":
        case "edge680":
        case "edge840":
        case "edge2000":
        case "edge3400":
        case "edge3800":
        case "edge3810":
            return 1900000;
        default:
            return 0;
    }
}
function max_tunnel (edge) {
    switch (edge) {
        case "edge510":
        case "edge510-lte":
        case "edge520":
        case "edge520-v":
        case "edge610":
        case "edge610-lte":
            return 50;
        case "edge540":
        case "edge540-poe":
        case "edge620":
            return 100;
        case "edge640":
        case "edge840":
            return 400;
        case "edge680":
            return 800;
        case "edge3400":
            return 4000;
        case "edge2000":
        case "edge3400":
        case "edge3800":
        case "edge3810":
            return 6000;
        default:
            return 0;
    }
}

function max_throughput_1300 (edge) {
    switch (edge) {
        case "edge510":
        case "edge510-lte":
        case "edge520":
        case "edge520-v":
            return 200000000;
        case "edge610":
        case "edge610-lte":
            return 350000000;
        case "edge540":
        case "edge540-poe":
            return 1000000000;
        case "edge620":
            return 1500000000;
        case "edge640":
            return 3000000000;
        case "edge840":
            return 4000000000;
        case "edge680":
            return 6000000000;
        case "edge3400":
            return 7000000000;
        case "edge2000":
        case "edge3800":
        case "edge3810":
            return 10000000000;
        default:
            return 0;
    }
}

function max_throughput_imix (edge) {
    switch (edge) {
        case "edge510":
        case "edge510-lte":
        case "edge520":
        case "edge520-v":
            return 100000000;
        case "edge610":
        case "edge610-lte":
            return 200000000;
        case "edge540":
        case "edge540-poe":
            return 500000000;
        case "edge620":
            return 750000000;
        case "edge640":
            return 1000000000;
        case "edge840":
            return 1500000000;
        case "edge680":
            return 2000000000;
        case "edge3400":
            return 2500000000;
        case "edge2000":
        case "edge3800":
        case "edge3810":
            return 5000000000;
        default:
            return 0;
    }
}


function max_throughput_64 (edge) {
    switch (edge) {
        case "edge510":
        case "edge510-lte":
        case "edge520":
        case "edge520-v":
            return 30000000;
        case "edge610":
        case "edge610-lte":
            return 40000000;
        case "edge540":
        case "edge540-poe":
            return 150000000;
        case "edge620":
            return 200000000;
        case "edge640":
            return 250000000;
        case "edge840":
            return 400000000;
        case "edge680":
            return 500000000;
        case "edge3400":
            return 650000000;
        case "edge2000":
        case "edge3800":
        case "edge3810":
            return 1000000000;
        default:
            return 0;
    }
}

function find_next_edge_flows (edge) {
    let cur_edge_max = max_concurrent_flows(edge);
    let arr_edges = [];
    for (let i=0; i < sale_edges.length; i++) {
        let fut_edge_max = max_concurrent_flows(sale_edges[i]);
        if (fut_edge_max != 0 && fut_edge_max > cur_edge_max) {
            arr_edges.push(sale_edges[i]);
        }  
    } 
    return arr_edges;
}

function find_next_edge_tunnel (edge) {
    let cur_edge_max = max_tunnel(edge);
    let arr_edges = [];
    for (let i=0; i < sale_edges.length; i++) {
        let fut_edge_max = max_tunnel(sale_edges[i]);
        if (fut_edge_max != 0 && fut_edge_max > cur_edge_max) {
            arr_edges.push(sale_edges[i]);
        }  
    } 
    return arr_edges;
}

function find_next_edge_throughput_1300 (edge) {
    let cur_edge_max = max_throughput_1300(edge);
    let arr_edges = [];
    for (let i=0; i < sale_edges.length; i++) {
        let fut_edge_max = max_throughput_1300(sale_edges[i]);
        if (fut_edge_max != 0 && fut_edge_max > cur_edge_max) {
            arr_edges.push(sale_edges[i]);
        }  
    } 
    return arr_edges;
}

function find_next_edge_throughput_imix (edge) {
    let cur_edge_max = max_throughput_imix(edge);
    let arr_edges = [];
    for (let i=0; i < sale_edges.length; i++) {
        let fut_edge_max = max_throughput_imix(sale_edges[i]);
        if (fut_edge_max != 0 && fut_edge_max > cur_edge_max) {
            arr_edges.push(sale_edges[i]);
        }  
    } 
    return arr_edges;
}

function find_next_edge_throughput_64 (edge) {
    let cur_edge_max = max_throughput_64(edge);
    let arr_edges = [];
    for (let i=0; i < sale_edges.length; i++) {
        let fut_edge_max = max_throughput_64(sale_edges[i]);
        if (fut_edge_max != 0 && fut_edge_max > cur_edge_max) {
            arr_edges.push(sale_edges[i]);
        }  
    } 
    return arr_edges;
}

function dictonary (metric) {
    let obj = {max: undefined, find: undefined}
    switch (metric) {
        case "flowCount":
            obj.max = max_concurrent_flows;
            obj.find = find_next_edge_flows;
            break;
        case "tunnelCount":
            obj.max = max_tunnel;
            obj.find = find_next_edge_tunnel;
            break;
        case "bitsPerSecondRx_1300":
            obj.max = max_throughput_1300;
            obj.find = find_next_edge_throughput_1300;
        case "bitsPerSecondRx_imix":
            obj.max = max_throughput_imix;
            obj.find = find_next_edge_throughput_imix;
        case "bitsPerSecondRx_64":
            obj.max = max_throughput_64;
            obj.find = find_next_edge_throughput_64;
         case "bitsPerSecondTx_1300":
            obj.max = max_throughput_1300;
            obj.find = find_next_edge_throughput_1300;
        case "bitsPerSecondTx_imix":
            obj.max = max_throughput_imix;
            obj.find = find_next_edge_throughput_imix;
        case "bitsPerSecondTx_64":
            obj.max = max_throughput_64;
            obj.find = find_next_edge_throughput_64;

    }
    return obj;
}

