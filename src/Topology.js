
class Topology{
    csv = [];
    nodes = [];
    edges = [];

    constructor(csvData){
        this.csv = csvData;

        const {nodes, edges} = this.prepareData();

        this.nodes = nodes;
        this.edges = edges;
    }

    prepareData(){
        let nodes = {};
        let edges = {};

        const items = this.getTopologyItems();

        for(let item of items){
            if(!nodes[item.from]){
                nodes[item.from] = {
                    id: item.from,
                    label: `${item.from}`
                };
            }


            if(!nodes[item.to]){
                nodes[item.to] = {
                    id: item.to,
                    label: `${item.to}`
                };
            }

        }

        for(let item of items){
            if(!edges[`${item.from}-${item.to}`]){
                edges[`${item.from}-${item.to}`] = {
                    font: {align: 'middle'},
                    from: item.from,
                    to: item.to,
                    title: ` ${item.from}:${item.fromPort} - ${item.to}:${item.toPort}`,
                    fromPort: item.fromPort,
                    toPort: item.toPort
                };
            }

        }

        const preparedNodes = [];
        const preparedEdges = [];

        for(let item in nodes){
            preparedNodes.push(nodes[item]);
        }

        for(let item in edges){
            preparedEdges.push(edges[item]);
        }

        return {nodes: preparedNodes, edges: preparedEdges}
    }

    getTopologyItems(){
        return this.csv.map(item => {
            return this.parseItem(item);
        });
    }

    parseItem(item){
        return {
            from: item[0],
            fromPort: item[1],
            to: item[2],
            toPort: item[3]
        }
    }
}

export default Topology;