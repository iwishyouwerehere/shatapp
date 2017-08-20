// define module imports
var writeNewMessageAction = require('./../actions/writeNewMessage.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    JsonRPCRequest = require('./../resources/types/jsonrpc').request;

module.exports = function sendMessageEvent(socket) {
    return function eventHandler(request, response) {
        // check params
        if (!(request.params
            && request.params['chatName']
            && request.params['msg'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName or message parameter' }) }, request.id)); }

        // broadcast message received to other sockets in the same room
        socket.broadcast.to(request.params['chatName']).emit('new_message', new JsonRPCRequest('SEND', { msg: request.params['msg'] }));

        // write to chat message received
        writeNewMessageAction(request.params['chatName'], request.params['msg']).then(() => {
            response(new JsonRPCResponse({ result: {} }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        })
    };
}