// define module imports
var writeNewMessageAction = require('./../actions/writeNewMessage.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response,
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    JsonRPCRequest = require('./../resources/types/jsonrpc').request,
    emitters = require('./../resources/emitters/');
// define global variables
var chatEmitter = emitters.chatEmitter;

module.exports = function sendMessageEvent(socket) {
    return function eventHandler(request, response) {        
        // check params
        if (!(request.params
            && request.params['chatName']
            && request.params['userName']
            && request.params['msg'])) { response(new JsonRPCResponse({ error: new JsonRPCError(400, "Bad Request", { cause: 'missing chatName or message parameter' }) }, request.id)); }

        // check if sender is in the socket chatroom
        if (!socket.rooms[request.params['chatName']]) {
            console.log('messaggio arrivato da uno non dentro al socket');
            let err = new JsonRPCError(401, "Unauthorized");
            response(new JsonRPCResponse({ error: err }, request.id));
            return;
        }

        // broadcast message received to other sockets in the same room
        socket.broadcast.to(request.params['chatName']).emit('new_message', new JsonRPCRequest('SEND', { msg: request.params['msg'] }));

        // emit user_active event
        chatEmitter.emit('user_active', { chatName: request.params['chatName'], userName: request.params['userName'] })
        // write to chat message received
        writeNewMessageAction(request.params['chatName'], request.params['msg']).then(() => {
            response(new JsonRPCResponse({ result: {} }, request.id));
        }).catch((err) => {
            if (!(err instanceof JsonRPCError)) { err = new JsonRPCError(500, "Internal Server Error"); }
            response(new JsonRPCResponse({ error: err }, request.id));
        })
    };
}