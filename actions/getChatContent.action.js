// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    getFileContent = require('./../resources/tools/getFileContent');

module.exports = function getChatContent(chatName) {

    // variables declaration
    var chatDir = './public/chats/' + chatName;

    // check params
    if (!fs.existsSync(chatDir)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // get chat content and resolve it
    return getFileContent(chatDir + '/chat.txt').then((chatContent) => {
        chatContent = chatContent.split('\n');
        if (chatContent[chatContent.length - 1] == '') { chatContent.pop() }
        return chatContent;
    });
};