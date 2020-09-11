import {Bridge} from "./Bridge";
import {Light} from "./Light";
import {Framework} from "./Framework"; ;



async function testing() {
    try {
        const test = new Framework();
        const bridges = await test.init();
        await test.addBridgeToConfig({            name: "Bridge 1",
            username:  "12351241",
            clientKey:  "3456346",
            macAddress:  "FF:AA:GG:CC:DD:EE",
            ipAddress:  "192.168.172.15",
            bridgeId:  "FFAAGGFFFECCDDEE",
            lights: { 
                "AS:TE:ST:f4:FA:DA" : {uniqueId: "AS:TE:ST:f4:FA:DA", id: "4", name: "TEST"}
        }
        })
    } catch (err) {
        console.log(err);
    }
}

testing();
