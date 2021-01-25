export const ERROR_CODES = {
  433: "Device does not support given behaviour.",
  500: "Device id already in use",
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
    this.description = description
  }

}