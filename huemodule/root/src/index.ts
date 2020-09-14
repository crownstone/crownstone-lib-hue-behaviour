import {Framework} from "./Framework";
import { Bridge } from "./Bridge";

export {Light} from "./Light";
export {Framework} from "./Framework";
export {Bridge} from "./Bridge"

async function testing(){
    const framework = new Framework();
    await framework.init();
    const notWorkingBridge = new Bridge("Hue color lamp 3","user","key","mac","192.168.178.12","-1",framework);
    console.log(await notWorkingBridge.init());
}

testing();