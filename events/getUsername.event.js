// define module imports
var generateUsernameAction = require('./../actions/generateUsername.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCRequest = require('./../resources/types/jsonrpc').request,
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    emitters = require('./../resources/emitters/');
// define global variables
var chatEmitter = emitters.chatEmitter;

module.exports = function getUsernameEvent(socket) {
    return function eventHandler(request, response) {     
        // check params
        if (!(request.params && request.params['chatName'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName parameter' }) }, request.id)); }
        // generate username and answer back
        generateUsernameAction(request.params['chatName'], socket.id).then((userName) => {
            // emit user_joined event
            chatEmitter.emit('user_joined', {
                chatName: request.params['chatName'],
                userName: userName
            });
            // add socket to chat room
            socket.join(request.params['chatName'], function joined(err) {
                if (!err) {
                    // answer back
                    response(new JsonRPCResponse({ result: userName }, request.id));
                } else {
                    response(new JsonRPCResponse({ error: new JsonRPCError(500, 'Internal Server Error', { cause: 'can\t join socket room' }) }, request.id));
                }
            });
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        });
    };
}