// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error;

module.exports = function writeNewMessage(chatName, msg) {

    // variables declaration
    var chatDir = './public/chats/' + chatName;
    
    // check params
    if (!fs.existsSync(chatDir)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // append new message after the others
    return new Promise((resolve, reject) => {
        fs.appendFile(chatDir + '/chat.txt', msg + '\n', function done(err) {
            if (!err) {
                resolve();
            } else {
                reject(new JsonRPCError(500, 'Internal Server Error'));
            }
        });
    });
};