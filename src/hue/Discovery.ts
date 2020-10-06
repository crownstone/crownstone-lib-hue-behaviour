import {Bridge} from "./Bridge";
import {discovery} from "node-hue-api/lib/v3";

export const Discovery = {

  /**
   * Searches the local network for bridges.
   *
   * @returns List of discovered bridges.
   *
   *
   */
  discoverBridges: async function (): Promise<Bridge[]> {
    try {
      const discoveryResults = await discovery.nupnpSearch();
      if (discoveryResults.length === 0) {
        return discoveryResults;
      } else {
        let bridges: Bridge[] = [];
        discoveryResults.forEach(item => {
          bridges.push(new Bridge(
            item.name,
            "",
            "",
            "",
            item.ipaddress,
            ""
          ))
        })
        return bridges;
      }
    } catch (err) {
      if (err.message.includes("ETIMEDOUT")) {
        return [];
      } else {
        throw err;
      }
    }
  }
}