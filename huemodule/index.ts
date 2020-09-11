import {Bridge} from "./Bridge";
import {Light} from "./Light";
import {Framework} from "./Framework"; ;



async function testing() {
    try {
        const test = new Framework();
        const bridges = await test.init();
        // const discoveredBridges = await test.discoverBridges();
        // console.log(await discoveredBridges[0].init());
        // const bridge = bridges[1];
        const bridge2 = bridges[0];
        // await bridge.init()
        await bridge2.init()
        // //
        const lights = bridge2.getConnectedLights()
        const light = bridge2.getLightById("00:17:88:01:10:25:5d:16-0b");
       // await  test.removeLightFromConfig(bridge2,"00:17:88:01:10:25:5d:16-0b");
        // console.log(lights)
        await bridge2.configureLight(4);
        // await light.setState({on:true} )
    } catch (err) {
        console.log(err);
    }
}

testing();
