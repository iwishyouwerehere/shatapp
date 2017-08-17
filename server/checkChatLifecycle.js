// define module imports
var sleep = require('sleep-async')(),
    fs = require('fs'),
    getFileContent = require('./../resources/tools/getFileContent');
// define global varibles
const MAX_CHAT_LIFETIME = 320000,
    activeChatsPath = './public/chats/chats.txt';

module.exports = function checkChatLifecycle() {
    console.log('checkChatLifecycle started');
    // check for undeleted lasting chats folders
    let activeChats = fs.readFileSync(activeChatsPath, { encoding: 'UTF-8' });
    activeChats = activeChats.split('\n').map((activeChat) => { return activeChat.trim(); });

    // bind to create_chat event
    process.on('message', function waitChatLifetime(chatName) {
        console.log('checkChatLifecycle chat created');
        let chatDir = './public/chats/' + chatName;
        // sleep for set chat lifetime
        sleep.sleepWithCondition(function condition() {
            // break sleep if chat folder no longer exists
            return !fs.existsSync(chatDir);
        }, MAX_CHAT_LIFETIME, function removeChat() {
            // delete chat folder and files
            if (fs.existsSync(chatDir)) {
                fs.unlinkSync(chatDir + '/chat.txt');
                fs.unlinkSync(chatDir + '/users.txt');
                fs.rmdirSync(chatDir);
            }
            // remove deleted chat name from active chats file
            let activeChats = fs.readFileSync(activeChatsPath, { encoding: 'UTF-8' });
            activeChats = activeChats.split('\n').map((activeChat) => { return activeChat.trim(); });
            activeChats.splice(activeChats.indexOf(chatName), 1);
            activeChats = activeChats.join('\n');
            fs.writeFileSync(activeChatsPath, activeChats);

            process.send(chatName);
        });
    });

}();