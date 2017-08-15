module.exports = class JsonRPCResponse {
    constructor(response, id = null) {
        this.jsonrpc = '2.0';
        this.result = response.result;
        this.error = response.error;
        this.id = id;
    }
}