// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    randName = require('./../resources/tools/generateRandName'),
    getFileContent = require('./../resources/tools/getFileContent');
// import emitter
var chatEmitter = require('./../resources/emitters/').chatEmitter;
// define global variables
const MAX_RESEARCHES = 15000,
    MAX_ACTIVE_CHATS = 300

module.exports = function createChatAction() {

    // variables declaration
    var activeChatsPath = './public/chats/chats.txt',
        chatDir = './public/chats',
        chatHtmlFileSource = './public/html/chat.html';

    // generate random name until it doesn't match any active chat name
    function researchChatName() {
        return new Promise((resolve, reject) => {
            // generate random name until it doesn't match any active chat name
            let researches = 0;
            let keepResearching = function keepResearching() {
                researches++;
                // limit reasearches
                if (researches > MAX_RESEARCHES) {
                    reject(new JsonRPCError(503, 'Service Unavailable'));
                    return;
                }
                getFileContent(activeChatsPath).then((activeChats) => {
                    activeChats = activeChats.split('\n').map((chatName) => { return chatName.trim(); });
                    // limit max active chats
                    if (activeChats.length >= MAX_ACTIVE_CHATS) {
                        reject(new JsonRPCError(409, "Conflict"));
                        return;
                    }
                    randName().then((chatName) => {
                        console.log(chatName);
                        if (activeChats.indexOf(chatName) != -1) {
                            // if chat name is already taken restart research
                            keepResearching();
                        } else {
                            resolve(chatName);
                        }
                    });
                });
            }();
        });
    };

    return researchChatName().then((chatName) => {
        // create chat folder
        chatDir = chatDir + '/' + chatName;

        if (!fs.existsSync(chatDir)) {
            fs.mkdirSync(chatDir);
        }
        // create chat files
        fs.writeFileSync(chatDir + '/chat.txt', "");
        fs.writeFileSync(chatDir + '/users.txt', "");
        // add chat name to active chats
        fs.appendFileSync(activeChatsPath, chatName + '\n');

        // emit event for checkChatLifecycle
        chatEmitter.emit('create_chat', chatName);

        // return chatName
        return chatName;
    });
};