import {CrownstoneHueError} from "./CrownstoneHueError";

export const GenericUtil = {
  deepCopy(obj: any) {
    let clonedObj: any
    if (obj instanceof Array) {
      clonedObj = []
      for (let i = 0, len = obj.length; i < len; i++) {
        (typeof (obj[i]) === "object") ? clonedObj[i] = this.deepCopy(obj[i]) : clonedObj[i] = obj[i];
      }
      return clonedObj;
    }
    if (obj instanceof Object) {
      clonedObj = {}
      Object.keys(obj).forEach(key => {
        (typeof (obj[key]) === "object") ? clonedObj[key] = this.deepCopy(obj[key]) : clonedObj[key] = obj[key];

      })
      return clonedObj;
    }
  },
  isConnectionError(err): boolean {
    if ((typeof (err.errorCode) !== "undefined" && err.errorCode === 404)
      || err.message.includes("ECONNRESET") || err.message.includes("ECONNREFUSED")
      || err.message.includes("ETIMEDOUT") || err.message.includes("ENOTFOUND")
      || err.message.includes("EHOSTUNREACH")) {
      return true;
    } else {
      return false;
    }
  },
  convertHueLibraryToCrownstoneError(err, extra?) {
    if (typeof (err.getHueErrorType) === "function") {
      switch (err.getHueErrorType()) {
        case 1:
          throw new CrownstoneHueError(401);
        case 101:
          throw new CrownstoneHueError(406);
        case -1:
          this.convertUnspecifiedError(err,extra);
        default:
          throw new CrownstoneHueError(999, err.message);
      }
    }
  },
  convertUnspecifiedError(err,extra){
    switch(err.message){
      case `Light ${extra} not found`:
        throw new CrownstoneHueError(422, extra);
      case `Light ${extra[0]} not found`:
        throw new CrownstoneHueError(422, extra[0]);
      default:
        throw new CrownstoneHueError(999, err.message);
    }
  }
}