import {CrownstoneHueError} from "./CrownstoneHueError";

export const GenericUtil = {
  deepCopy(obj: any): any {
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
  isConnectionError(err: any): boolean {
    if ((err.errorCode !== undefined && err.errorCode === 404)
      || ((err.code !== undefined) && (err.code == "ENOTFOUND"
        || err.code == "ECONNREFUSED" || err.code == "ETIMEDOUT"
        || err.code == "ECONNRESET")) || err.message.includes("ECONNRESET")
      || err.message.includes("ECONNREFUSED") || err.message.includes("ETIMEDOUT")
      || err.message.includes("ENOTFOUND") || err.message.includes("EHOSTUNREACH")) {
      return true;
    }
    else {
      return false;
    }
  },
  convertHueLibraryToCrownstoneError(err: any, extra?: any): void {
    if (typeof (err.getHueErrorType) === "function") {
      switch (err.getHueErrorType()) {
        case 1:
          throw new CrownstoneHueError(401);
        case 101:
          throw new CrownstoneHueError(406);
        case -1:
          this.convertUnspecifiedError(err, extra);
        default:
          throw new CrownstoneHueError(999, err.message);
      }
    }
  },
  convertUnspecifiedError(err: any, extra: any): void {
    switch (err.message) {
      case `Light ${extra} not found`:
        throw new CrownstoneHueError(422, extra);
      case `Light ${extra[0]} not found`:
        throw new CrownstoneHueError(422, extra[0]);
      default:
        throw new CrownstoneHueError(999, err.message);
    }
  },
  isEqual(objA:any,objB:any):boolean{
  if (objA instanceof Array) {
    if(!(objB instanceof Array)){
      return false;
    }
    if(objA.length !== objB.length){
      return false;
    }

    for (let i = 0, len = objA.length; i < len; i++) {
      if (typeof (objA[i]) === "object" && typeof (objB[i]) === "object") {
        if (!this.isEqual(objA[i], objB[i])) {
          return false;
        }
      }
      else if (objA[i] !== objB[i]) {
        return false;
      }
    }
    return true;
  }
  if (objA instanceof Object) {
    if(!(objB instanceof Object)){
      return false;
    }
    for (const key of Object.keys(objA)){
      if (typeof (objA[key]) === "object" && typeof (objB[key]) === "object") {
        if (!this.isEqual(objA[key], objB[key])) {
          return false;
        }
      }
      else if (objA[key] !== objB[key]) {
        return false;
      }
    }
    return true;
  }
  return (objA === objB);
}

}