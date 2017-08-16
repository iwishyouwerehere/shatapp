module.exports.response = class JsonRPCResponse {
    constructor(response, id = null) {
        this.jsonrpc = '2.0';
        this.result = response.result;
        this.error = response.error;
        this.id = id;
    }
}

module.exports.request = class JsonRPCRequest {
    constructor(method, params = null, id = null) {
        this.jsonrpc = '2.0';
        this.method = method;
        this.params = params;
        this.id = id;
    }
}

module.exports.error = class JsonRPCError {
    constructor(code, message, data = null) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}