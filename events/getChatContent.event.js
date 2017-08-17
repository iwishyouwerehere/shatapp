// define module imports
var getChatContentAction = require('./../actions/getChatContent.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    JsonRPCRequest = require('./../resources/types/jsonrpc').request;

module.exports = function getChatContentEvent(socket) {
    return function eventHandler(request, response) {
        console.log('request getChatContentEvent', request);
        // check params
        if (!(request.params
            && request.params['chatName'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName parameter' }) }, request.id)); }

        // get chat content and answer back
        getChatContentAction(request.params['chatName']).then((chatContent) => {
            response(new JsonRPCResponse({ result: chatContent }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        });
    };
}