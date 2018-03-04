import * as vis from 'vis';
var csv = require('parse-csv');
import Topology from './Topology';
import csvTopologyRawData from '../data/hackaton_topology.csv';
import csvVlanRawData from '../data/hackaton_vlans_raw.csv';
// import csvTopologyRawData from '../data/hackaton_topology_stand.csv';
// import csvVlanRawData from '../data/new_hakaton_vlan_raw_stand.csv';
import Vlan from "./Vlan";
import Network from './Network';
import Ui from './Ui'
import {STATISTIC_ITEMS} from './Ui';

const topology = new Topology(csvTopologyRawData);
const vlan = new Vlan(csvVlanRawData);

const network = new Network(
    document.getElementById('network'),
    topology,
    vlan
);


Ui.showNetworkLoader();

network.onVLANChanged = (vlanKey) => {
    const errors = network.getDetailErrors();
    Ui.displayStatisticValue(STATISTIC_ITEMS.CURRENT_VLAN, vlanKey);
    Ui.displayStatisticValue(STATISTIC_ITEMS.ERROR_TOTAL, network.errors.length)
    Ui.displayErrors(errors);
};

network.onLoadingDone = () => {
    Ui.displayStatisticValue(STATISTIC_ITEMS.NODE_TOTAL, network.topology.nodes.length);
    Ui.displayStatisticValue(STATISTIC_ITEMS.VLAN_TOTAL, Object.keys(network.vlan.vlans).length);

    Ui.hideNetworkLoader();
};

network.onProgressChanged = (progress) => {
    Ui.setNetworkLoaderProgress(progress);
};

$('.ui.dropdown')
    .dropdown({
        values: vlan.getDropdownValues(),
        onChange: function(value, text, $selectedItem) {
            network.setVlan(value);
        }
    });