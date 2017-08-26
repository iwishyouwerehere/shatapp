// define module imports
var sleep = require('sleep-async')(),
    fs = require('fs'),
    getFileContent = require('./../resources/tools/getFileContent');
// define global varibles
const MAX_USER_INACTIVITY = 15000;

module.exports = function checkUsersActivity() {
    console.log('checkUsersActivity subprocess started');
    let inactivityRegister = {};

    function deleteInactiveUser(chatName, userName) {
        console.log('deleting user', chatName, userName);
        let chatUsersPath = './public/chats/' + chatName + '/users.json';
        // delete user from active users file
        getFileContent(chatUsersPath).then(activeUsers => {
            activeUsers = JSON.parse(activeUsers);
            let socketId = activeUsers[userName];
            delete activeUsers[userName];
            fs.writeFileSync(chatUsersPath, JSON.stringify(activeUsers));
            // delete item from inactivityRegister
            delete inactivityRegister[chatName][userName];
            // answer back
            process.send({ chatName: chatName, userName: userName, socketId: socketId });
        });
    }

    // bind to user_joined event
    process.on('message', function setUserTimeout(message) {
        if (message.event == 'user_joined') {
            if (!inactivityRegister[message.data.chatName]) { inactivityRegister[message.data.chatName] = {} };
            let timeout = setTimeout(deleteInactiveUser, MAX_USER_INACTIVITY, message.data.chatName, message.data.userName);
            inactivityRegister[message.data.chatName][message.data.userName] = timeout;
        } else {
            let registeredTimeout = inactivityRegister[message.data.chatName][message.data.userName];
            clearTimeout(registeredTimeout);
            let timeout = setTimeout(deleteInactiveUser, MAX_USER_INACTIVITY, message.data.chatName, message.data.userName);
            inactivityRegister[message.data.chatName][message.data.userName] = timeout;
        }
    });
}();