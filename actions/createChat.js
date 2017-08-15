var fs = require('fs'),
    fsExtra = require('fs-extra'),
    randName = require('./../resources/tools/generateRandName'),
    getFileContent = require('./../resources/tools/getFileContent'),
    activeChatsPath = './chats/chats.txt',
    chatDir = './chats';

module.exports = function () {

    // generate random name until it doesn't match any active chat name
    function researchChatName() {
        return new Promise((resolve, reject) => {
            // generate random name until it doesn't match any active chat name
            getFileContent(activeChatsPath).then((activeChats) => {
                activeChats = activeChats.split('\n');
                randName().then((chatName) => {
                    console.log(chatName);
                    if (activeChats.indexOf(chatName) != -1) {
                        // if chat name is already taken restart research
                        console.log('esiste gia');

                        return researchChatName();
                    } else {
                        resolve(chatName);
                    }
                });
            });
        });
    };

    return new Promise((resolve, reject) => {
        researchChatName().then((chatName) => {
            // create chat folder
            chatDir = chatDir + '/' + chatName;
            if (!fs.existsSync(chatDir)) {
                fs.mkdirSync(chatDir);
            }
            fsExtra.mkdirpSync(chatDir);
            // create chat files
            fs.writeFileSync(chatDir + '/chat.txt', "");
            fs.writeFileSync(chatDir + '/chat.html', "");
            fs.writeFileSync(chatDir + '/users.txt', "");
            // add chat name to active chats
            fs.appendFileSync(activeChatsPath, chatName + '\n');
            resolve(chatName);
        });
    });
};