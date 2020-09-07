////import * as hueModule from "./app";
//////Local testing purposes \/
////function printErrorCode(errorCode) {
////    switch (errorCode) {
////        case (hueModule.NO_BRIDGES_DISCOVERED): {
////            console.log("No bridges found in the network.");
////            break;
////        }
////        case (hueModule.NO_BRIDGES_IN_CONFIG): {
////            console.log("No bridges in config file found.");
////            break;
////        }
////        case (UNAUTHORIZED_USER): {
////            console.log("User not authorized/wrong username.");
////            break;
////        }
////        case (BRIDGE_LINK_BUTTON_UNPRESSED): {
////            console.log("The Link button on the bridge was not pressed. Please press the Link button and try again.");
////            break;
////        }
////        default:
////            console.log(errorCode);
////            break;
////    }
////}
////async function dev() {
////    var result = await initModule();
////    if (result === NO_BRIDGES_IN_CONFIG) {
////        printErrorCode(result);
////        console.log("Init. bridge discovery");
////        result = await initBridgeDiscovery();
////        if (typeof (result) === "string") {
////            printErrorCode(result);
////        }
////    }
////    await getConfigSettings();
////    //console.log(Object.keys(configSettings["bridges"])[0]); 
////    const firstBridge = Object.keys(configSettings["bridges"])[0];
//"192.168.178.74": {
//    "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
//        "clientkey": "F713C35839453184BA3B148E5504C74B",
//            "mac-address": "00:17:88:29:2a:f4",
//                "name": "Philips hue"
//}
////    const authenticatedApi = await hueApi.createLocal(firstBridge).connect(configSettings["bridges"][firstBridge]["username"]);
////    await getAllLights(authenticatedApi).then(allLights => {
////        console.log(JSON.stringify(allLights, null, 2));
////        rl.question("Man. light?", async function (answer) {
////            if (answer != "") {
////                allLights.forEach(async light => {
////                    console.log(light.id);
////                    manipulateLight(authenticatedApi, light.id, { on: true, ct: answer });
////                });
////            } else {
////                allLights.forEach(async light => {
////                    console.log(light.id);
////                    manipulateLight(authenticatedApi, light.id, { on: false });
////                });
////            }
////            rl.close();
////        });
////    });
////    //await getAllUsers(authenticatedApi);
////}
////dev();
//# sourceMappingURL=test.js.map