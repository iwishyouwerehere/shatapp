// define module imports
var fs = require('fs');

module.exports = function existChat(chatName) {

    // variables declaration
    var chatDir = './public/chats/' + chatName

    // check if chatDir exists
    return fs.existsSync(chatDir);
};