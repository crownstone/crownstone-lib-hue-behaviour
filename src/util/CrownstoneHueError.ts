export const ERROR_CODES = {
  401: "Unauthorized user on Bridge.",
  404: "Bridge is unreachable and probably offline.",
  405: "Bridge is not authenticated for this action.",
  406: "Link button on Bridge is not pressed.",
  407: "Bridge is not initialized.",
  408: "Bridge has no Bridge Id and thus cannot be rediscovered.",
  410: "Configuration settings are undefined.",
  422: "Light is not found on the bridge.",
  888: "Unknown action call to Hue Api.",
  999: "Unknown Error, see description."
}


export class CrownstoneHueError extends Error {
  errorCode: number;
  description: string;

  constructor(errorCode, description?) {
    if (description == undefined) {
      description = "";
    }
    super(ERROR_CODES[errorCode]);
    this.errorCode = errorCode;
    this.name = "CrownstoneHueError";
    this.description = description;
  }
}