
- There is no method to change the sphere location on CrownstoneHueBehaviour.
- How am I supposed to use this with a different persistence?
- What exactly is the purpose of persistence here? On every start of this module, wouldnt I just do a addBridge and addLight?

- When using a database to store hues and lights, I would have a table of Bridge entries, a table of light entries and finally a table of behaviour entries.
I would query the bridge table to get me the bridge, it's connected lights, and their connected behaviours. I would expect to then have a CrownstoneHueBehaviour.init(data, sphereLocation) method where I drop the data in.

There would nearly always be a managing layer on top of your code. It would receive updates from a cloud, update it's database and apply these changes to your code by say removeLight. The link to persitance at that point does not seem required.

By design the states of the Hue lights are not in the persistence?

- Put default parameters in the function that is being called, not in the one calling it (when possible)
```
const bridge = new Bridge(config.name || "", config.username || "", config.clientKey || "", config.macAddress || "", config.ipAddress || "1.1.1.1", config.bridgeId || "");

constructor(name: string = '', username: string = '', clientKey: string = '', macAddress: string = '', ipAddress: string = '1.1.1.1', bridgeId: string = "") { // TODO: <-- like this
```
Consider using null instead of empty strings. 1.1.1.1 especially is a bit of an ugly hack. Is this required for node-hue-api?

- Rule of thumb, if you have more than 5 parameters in a function call, consider making it a single object. this is easier to read and document. Using typescript interfaces also improves the process.
This is especially true if some of these are optional!

```
const bridge = new Bridge("", "", "", "", discoveryResult.internalipaddress, discoveryResult.id);

would become

const bridge = new Bridge({
    ipAddress: discoveryResult.internalipaddress, 
    bridgeId: discoveryResult.id
});
```

- try to add type information to all arguments
```
async removeBehaviour(lightId,cloudId): Promise<void> { 

sync removeBehaviour(lightId: string, cloudId: string): Promise<void> {
```

- Matter of preference, but I prefer the: 
```
if (statement) {

}
else {

}

over:
if (statement) {

} else {

}
```
This is under discussion as you've might have seen it pass by in the office channel.

- Try protecting your init methods so they won't be invoked more than once. This can lead to a lot of bugs that are hard to track down.

- Integration tests with mocks fail:
```
tests/integration/integrationMocked.test.ts (7.709 s)
  ● Integration Test with mocks › Init from empty config

    TypeError: Cannot read property 'behaviours' of undefined

      137 |   appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void {
      138 |     this.isConfiguredCheck();
    > 139 |     this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[behaviour].behaviours.push(GenericUtil.deepCopy(behaviour));
          |                                                                          ^
      140 |   }
      141 | 
      142 |   updateBehaviour(bridgeId:string, lightId:string, updatedBehaviour:HueBehaviourWrapper): void {

      at Persistence.appendBehaviour (src/util/Persistence.ts:139:74)
      at CrownstoneHueBehaviour.addBehaviour (src/CrownstoneHueBehaviour.ts:95:27)
      at Object.<anonymous> (tests/integration/integrationMocked.test.ts:55:25)

  ● Integration Test with mocks › Init from config

    TypeError: Cannot read property 'behaviours' of undefined

      137 |   appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void {
      138 |     this.isConfiguredCheck();
    > 139 |     this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[behaviour].behaviours.push(GenericUtil.deepCopy(behaviour));
          |                                                                          ^
      140 |   }
      141 | 
      142 |   updateBehaviour(bridgeId:string, lightId:string, updatedBehaviour:HueBehaviourWrapper): void {

      at Persistence.appendBehaviour (src/util/Persistence.ts:139:74)
      at CrownstoneHueBehaviour.addBehaviour (src/CrownstoneHueBehaviour.ts:95:27)
      at Object.<anonymous> (tests/integration/integrationMocked.test.ts:97:25)

  ● Integration Test with mocks › Scenario

    TypeError: Cannot read property 'behaviours' of undefined

      137 |   appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void {
      138 |     this.isConfiguredCheck();
    > 139 |     this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[behaviour].behaviours.push(GenericUtil.deepCopy(behaviour));
          |                                                                          ^
      140 |   }
      141 | 
      142 |   updateBehaviour(bridgeId:string, lightId:string, updatedBehaviour:HueBehaviourWrapper): void {

      at Persistence.appendBehaviour (src/util/Persistence.ts:139:74)
      at CrownstoneHueBehaviour.addBehaviour (src/CrownstoneHueBehaviour.ts:95:27)
      at Object.<anonymous> (tests/integration/integrationMocked.test.ts:136:25)

  ● Integration Test with mocks › Removing and updating

    TypeError: Cannot read property 'behaviours' of undefined

      137 |   appendBehaviour(bridgeId:string, lightId:string, behaviour:HueBehaviourWrapper): void {
      138 |     this.isConfiguredCheck();
    > 139 |     this.configuration[CONF_BRIDGE_LOCATION][bridgeId].lights[behaviour].behaviours.push(GenericUtil.deepCopy(behaviour));
          |                                                                          ^
      140 |   }
      141 | 
      142 |   updateBehaviour(bridgeId:string, lightId:string, updatedBehaviour:HueBehaviourWrapper): void {

      at Persistence.appendBehaviour (src/util/Persistence.ts:139:74)
      at CrownstoneHueBehaviour.addBehaviour (src/CrownstoneHueBehaviour.ts:95:27)
      at Object.<anonymous> (tests/integration/integrationMocked.test.ts:229:25)

```

- Try to exclude the integration tests that can't work without a hue bridge connected from npm run test.

- Are set light commands acked by the hue lights? If so, how is error handling of this? 