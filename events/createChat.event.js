var createChatAction = require('./../actions/createChat.action'),
    JsonRPCResponse = require('./../resources/types/jsonrpc').response;


module.exports = function createChatEvent(request, response) {
    console.log('request createChatEvent', request);
    createChatAction().then((chatName) => {
        response(new JsonRPCResponse({ result: chatName }, request.id ));
    }).catch((err) => {
        response(new JsonRPCResponse({ error: err }, request.id));
    })
}