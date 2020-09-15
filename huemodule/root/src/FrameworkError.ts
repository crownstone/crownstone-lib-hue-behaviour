export const ERROR_CODES = {
    401: "Unauthorized user on Bridge.",
    404: "Bridge is unreachable and probably offline.",
    405: "Bridge is not authenticated.",
    406: "Link button on Bridge is not pressed.",
    410: "Configuration settings are undefined.",
    422: "Light is not found on the bridge.",
    999: "Unknown Error, see description."
}


export class FrameworkError extends Error {
    errorCode: number;
    description: string;
    constructor(errorCode,description?) {
        if(description == undefined){
            description = "";
        }
        super(ERROR_CODES[errorCode]);
        this.errorCode = errorCode;
        this.name = "FrameworkError";
        this.description = description;
    }


    getDescription(){
        return ERROR_CODES[this.errorCode];
    }
}