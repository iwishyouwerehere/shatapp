// define module imports
var path = require('path'),
    fs = require('fs');

// define global varibles
const activeChatsPath = './public/chats/chats.txt';

module.exports = function (app) {
    app.get('/chats/', function (req, res) {
        res.redirect('/');
    });
    app.get('/chats/:chat/chat.html', function (req, res) {
        // check if chatName url correspond to any of the active chat, if not server "wrong chat html"
        let chatName = req.params.chat;
        let activeChats = fs.readFileSync(activeChatsPath, { encoding: 'UTF-8' });
        activeChats = activeChats.split('\n').map((activeChat) => { return activeChat.trim(); });
        if (activeChats.indexOf(chatName) != -1) {
            res.sendFile(path.join(__dirname + '/../public/html/chat.html'));
        } else {
            res.sendFile(path.join(__dirname + '/../public/html/chat-not-found.html'));
        }
    });
}