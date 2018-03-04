var hexToBinary = require('hex-to-binary');

class Vlan{
    csv = [];
    vlans = {};

    constructor(csvData){
        this.csv = csvData;
        this.prepareData();

        let data = [];

        for(let item in this.vlans){
            let vlans = this.vlans[item];

            for(let vlan of vlans){
                // if(vlan.vlan == 103){
                //     data.push(` ${vlan.ports.join('|')}`)
                // }
                data.push(`${vlan.ip},${vlan.tagged},${vlan.vlan},${vlan.ports.join('|')};`)
            }
        }

    }

    getVlan(vlan){
        return this.vlans[vlan] || [];
    }

    getDropdownValues(){
        const values = [];

        for(let key in this.vlans){
            values.push({
                name: key,
                value: key
            })
        }

        return values;
    }

    prepareData(){
        const items = this.getVlanItems();

        for(let item of items){
            if(!this.vlans[item.vlan]){
                this.vlans[item.vlan] = [];
            }

            this.vlans[item.vlan].push(item);
        }
    }

    getVlanItems(){
        return this.csv.map(item => {
            return this.parseItem(item);
        });
    }

    parseItem(item){
        return {
            ip: item[0],
            tagged: item[1] === 'tagged',
            vlan: item[2],
            ports: this.getPortsFromBinary(hexToBinary(item[3].toString().replace('0x', '')))
        }
    }

    getPortsFromBinary(binary){
        const ports = [];
        binary = binary.split('');
        for(let i in binary){
            if(binary[i] === '1'){
                ports.push(parseInt(i) +1);
            }
        }

        return ports
    }
}

export default Vlan;