// define module imports
var createChatAction = require('./../actions/createChat.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response;


module.exports = function createChatEvent(socket) {
    return function eventHandler(request, response) {
        console.log('request createChatEvent', request);
        createChatAction().then((chatName) => {
            response(new JsonRPCResponse({ result: chatName }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        });
    };    
}