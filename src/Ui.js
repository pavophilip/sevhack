import {NETWORK_NODE_ERROR_CODE} from "./Network";

const STATISTIC_ITEMS = {
    NODE_TOTAL: 'node-total-value',
    VLAN_TOTAL: 'vlan-total-value',
    CURRENT_VLAN: 'current-vlan-value',
    NODE_SUCCESS: 'node-success-value',
    ERROR_TOTAL: 'errors-total-value'
}
export {STATISTIC_ITEMS};

class Ui{
    static symbols = {
        RIGHT_ARROW: '➞',
        LEFT_ARROW: '←',
        RIGHT_ARROW_ERROR: '⇥',
        LEFT_ARROW_ERROR: '⇤',
        STATUS_ERROR_ICON: 'times'
    };

    static setNetworkLoaderProgress(percent){
        $('.network-dimmer .percent-progress').text(`${percent} %`)
    }

    static showNetworkLoader(){
        $('.network-dimmer').dimmer('show');
    }

    static hideNetworkLoader(){
        $('.network-dimmer').dimmer('hide');
    }

    static displayErrors(errors){
        const html = Ui.buildErrors(errors);

        $('.errors-container').html(html)
    }

    static displayStatisticValue(statistic, value){
        $(`#${statistic}`).text(value);
    }



    static buildErrors(errors){
        let html = "";
        for(let error of errors){
            if(error.error === NETWORK_NODE_ERROR_CODE.PORT_UNUSED){
                html += Ui.buildUnusedPortError(error.id, error.unusedTaggedPorts, error);
            }else{
                html += Ui.buildError(
                    `${error.from}:${error.fromPort}`,
                    `${error.to}:${error.toPort}`,
                    error.error
                );
            }
        }

        return html;
    }

    static buildUnusedPortError(ip, ports, error){
        console.log(error);

        let description = `Ошибка тегирования устройств на портах: ${ports.join(', ')}`;

        return `
            <div class="error-item"  data-position="top right" data-tooltip="${description}">
                  <a class="ui label red small">
                    <i class="hdd outline icon"></i> ${ip}
                  </a>
                  <span>
                    <span style="color: red">${Ui.symbols.RIGHT_ARROW_ERROR}</span>
                        <i class="icon times" style="color: red;"></i>
                        <i class="icon desktop" style="color: blue;"></i>
                  </span>
            </div>
        `;
    }

    static buildError(source, target, error){
        let sourceColor = 'green';
        let targetColor = 'green';

        let sourceArrow = Ui.symbols.RIGHT_ARROW;
        let targetArrow = Ui.symbols.LEFT_ARROW;

        let statusIcon = Ui.symbols.STATUS_ERROR_ICON;
        let statusColor = 'red';

        let description = '';

        if(error === NETWORK_NODE_ERROR_CODE.SOURCE_PORT_UNDEFINED){
            sourceColor = 'red';
            sourceArrow = Ui.symbols.RIGHT_ARROW_ERROR;
            description = 'Нет требуемого порта в источнике';
        }

        if(error === NETWORK_NODE_ERROR_CODE.TARGET_PORT_UNDEFINED){
            targetColor = 'red';
            targetArrow = Ui.symbols.LEFT_ARROW_ERROR;
            description = 'Нет требуемого порта в приемнике';
        }

        let html = `
            <div class="error-item"  data-tooltip="${description}">
              <a class="ui label ${sourceColor} small">
                <i class="hdd outline icon"></i> ${source}
              </a>
              <span>
                <span style="color: ${sourceColor};">${sourceArrow}</span>
                    <i class="icon ${statusIcon}" style="color: ${statusColor};"></i>
                <span style="color: ${targetColor}">${targetArrow}</span>
              </span>

              <a class="ui label ${targetColor} small">
                <i class="hdd outline icon"></i> ${target}
              </a>
            </div>`;

        return html;
    }
}

export default Ui;