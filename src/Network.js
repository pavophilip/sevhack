import * as vis from "vis";

const EDGE_STATUS = {
    NONE: 'none',
    SOURCE_PORT_UNDEFINED: 'source_port_undefined',
    TARGET_PORT_UNDEFINED: 'target_port_undefined',
    SOURCE_PORT_DEFINED: 'source_port_defined',
    TARGET_PORT_DEFINED: 'target_port_defined',
    SOURCE_PORT_UNTAGGED: 'source_port_untagged',
    TARGET_PORT_UNTAGGED: 'target_port_untagged',
    SOURCE_PORT_TAGGED: 'source_port_tagged',
    TARGET_PORT_TAGGED: 'target_port_tagged',
    TAGGED: 'tagged',

};

const NETWORK_NODE_ERROR_CODE = {
    TARGET_NOT_TAGGED: 1,
    SOURCE_NOT_TAGGED: 2,
    SOURCE_PORT_UNDEFINED: 3,
    TARGET_PORT_UNDEFINED: 4,
    PORT_UNUSED: 5,
};

const EDGE_STATUS_STYLE = {
    none: {
        color: {
            color: 'blue'
        },
    },
    source_port_undefined: {
        width: 4,
        color: {
            color: 'red'
        }
    },
    target_port_defined: {
        width: 4,
        color: {
            color: 'red'
        }
    },
    source_port_defined: {
        width: 4,
        color: {
            color: 'red'
        }
    },
    target_port_undefined: {
        width: 4,
        color: {
            color: 'red'
        }
    },
    source_port_untagged: {
        width: 4,
        color: {
            color: 'orange'
        }
    },
    target_port_untagged: {
        width: 4,
        color: {
            color: 'orange'
        }
    },
    tagged: {
        width: 4,
        color: {
            color: 'green'
        }
    }
};

export {EDGE_STATUS, NETWORK_NODE_ERROR_CODE, EDGE_STATUS_STYLE};

class Network{
    network = null;
    vlan = null;
    topology = null;

    nodesDataSet = null;
    edgesDataSet = null;
    previousChanges = [];

    errors = [];

    options = {
        nodes: {
            shape: 'box',
            size: 16,
            font: { multi: 'html', size: 12 }
        },
        edges: {
            length: 200,
            smooth: {
                enabled: true
            },
        },
        layout:{
            randomSeed:34
        },
        physics: {

        }
    };

    constructor(container, topology, vlan){
        this.container = container;
        this.topology = topology;
        this.vlan = vlan;

        this.topology.edges = this.topology.edges.map(item => {
             return this.resetEdge(item);
        });

        this.nodesDataSet = new vis.DataSet(this.topology.nodes);
        this.edgesDataSet =  new vis.DataSet(this.topology.edges);

        this.network = new vis.Network(this.container, {
            nodes: this.nodesDataSet,
            edges: this.edgesDataSet
        }, this.options);

        this.network.on("stabilizationProgress", (params) => {
            this.onProgressChanged((100 * params.iterations / params.total).toFixed());
        });

        this.network.once("stabilizationIterationsDone", () =>  {
            this.onLoadingDone();
        });
    }

    onProgressChanged(progress){}

    onLoadingDone(){}

    onVLANChanged(){}

    resetEdge(edge){
        let item = {
            ...edge
        };

        item.status = 'none';
        item.color = {
            color: 'blue'
        };
        item.width = 1;

        delete item.label;

        return item;
    }

    resetNode(node){
        let item = {
            ...node
        }

        delete item.unusedTaggedPorts;
        delete item.status;
        return item;
    }

    getDetailErrors(){
        const errors = [];

        for(let node of this.topology.nodes){
            if(!node.unusedTaggedPorts || !node.unusedTaggedPorts.length){
                continue;
            }


            errors.push({
                error: NETWORK_NODE_ERROR_CODE.PORT_UNUSED,
                ...node
            })
        }

        for(let edge of this.topology.edges){
            if(edge.status === EDGE_STATUS.TARGET_PORT_TAGGED){
                errors.push({
                    error: NETWORK_NODE_ERROR_CODE.SOURCE_NOT_TAGGED,
                    ...edge
                });
            }else if(edge.status === EDGE_STATUS.SOURCE_PORT_TAGGED){
                errors.push({
                    error: NETWORK_NODE_ERROR_CODE.TARGET_NOT_TAGGED,
                    ...edge
                });
            }else if(edge.status === EDGE_STATUS.TARGET_PORT_DEFINED){
                errors.push({
                    error: NETWORK_NODE_ERROR_CODE.SOURCE_PORT_UNDEFINED,
                    ...edge
                })
            }else if(edge.status === EDGE_STATUS.SOURCE_PORT_DEFINED){
                errors.push({
                    error: NETWORK_NODE_ERROR_CODE.TARGET_PORT_UNDEFINED,
                    ...edge
                })
            }
        }
        this.errors = errors;

        return errors;
    }

    setVlan(vlan){
        const vlanKey = vlan;
        vlan = this.vlan.vlans[vlan];

        if(this.previousChanges.length){
            let edges = this.previousChanges.map(item => {
                return this.resetEdge(item);
            });
            this.topology.edges = edges;
            this.edgesDataSet.update(edges);
        }

        this.topology.nodes = this.topology.nodes.map(item => {
            return this.resetNode(item)
        });

        for(let itemIndex in vlan){
            let item = vlan[itemIndex];

            if(item.tagged){
                item.unusedTaggedPorts = item.ports.map(item => item);
            }

            for(let index in this.topology.edges){
                let edge = this.topology.edges[index];

                if(item.ip === edge.from && !!~item.ports.indexOf(edge.fromPort)){
                    if(item.tagged){
                        const indexOfPort = item.unusedTaggedPorts.indexOf(edge.fromPort)
                        if(!!~indexOfPort){
                            item.unusedTaggedPorts.splice(indexOfPort, 1);
                        }
                    }


                    if(edge.status === EDGE_STATUS.TARGET_PORT_DEFINED){
                        edge.status = EDGE_STATUS.TAGGED;
                    }else{
                        edge.status = EDGE_STATUS.SOURCE_PORT_DEFINED;
                    }

                    if(!item.tagged){
                        edge.status = EDGE_STATUS.SOURCE_PORT_UNTAGGED;
                    }
                }

                if(item.ip === edge.to && !!~item.ports.indexOf(edge.toPort)){
                    if(item.tagged){
                        const indexOfPort = item.unusedTaggedPorts.indexOf(edge.toPort)
                        if(!!~indexOfPort){
                            item.unusedTaggedPorts.splice(indexOfPort, 1);
                        }
                    }


                    if(edge.status === EDGE_STATUS.SOURCE_PORT_DEFINED){
                        edge.status = EDGE_STATUS.TAGGED;
                    }else{
                        edge.status = EDGE_STATUS.TARGET_PORT_DEFINED;
                    }

                    if(!item.tagged){
                        edge.status = EDGE_STATUS.TARGET_PORT_UNTAGGED;
                    }
                }

                this.topology.edges[index] = edge;
            }

            for(let nodeIndex in this.topology.nodes) {
                let node = this.topology.nodes[nodeIndex];
                if (item.ip === node.id) {
                    if(!node.unusedTaggedPorts){
                        node.unusedTaggedPorts = item.unusedTaggedPorts;
                    }

                    if(!item.tagged){
                        node.unusedTaggedPorts = arr_diff(node.unusedTaggedPorts, item.ports);
                    }
                }

                this.topology.nodes[nodeIndex] = node;
            }
            this.vlan.vlans[vlanKey][itemIndex] = item;
        }

        const changed = [];

        for(let index in this.topology.edges){
            let edge = this.topology.edges[index];

            if(edge.status){
                edge = {
                    ...edge,
                    ...EDGE_STATUS_STYLE[edge.status],
                    //label: edge.title

                };
                changed.push(edge);
            }

            this.topology.edges[index] = edge;
        }

        this.edgesDataSet.update(changed);
        this.previousChanges = changed;

        this.onVLANChanged(vlanKey);
    }
}

function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

export default Network;