// define module imports
var existChatAction = require('./../actions/existChat.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error;

module.exports = function existChatEvent(socket) {
    return function eventHandler(request, response) {
        // check params
        if (!(request.params
            && request.params['chatName'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName parameter' }) }, request.id)); }

        // get chat content and answer back
        let exist = existChatAction(request.params['chatName']);
        response(new JsonRPCResponse({ result: exist }, request.id));
    };
}