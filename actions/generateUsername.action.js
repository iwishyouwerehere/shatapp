// define module imports
var fs = require('fs'),
    JsonRPCError = require('./../resources/types/jsonrpc').error,
    randName = require('./../resources/tools/generateRandName'),
    getFileContent = require('./../resources/tools/getFileContent');
// define global variables
const MAX_RESEARCHES = 15000,
    MAX_ACTIVE_USERS = 300

module.exports = function generateUsername(chatName, socket) {

    // variables declaration
    var chatDir = './public/chats/' + chatName,
        activeUsersPath = chatDir + '/users.json';

    // check params
    if (!fs.existsSync(chatDir)) { return Promise.reject(new JsonRPCError(400, "Bad Request", { cause: "wrong chat name" })); }

    // generate random name until it doesn't match any active user name
    function researchUserName() {
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
                getFileContent(activeUsersPath).then((activeUsers) => {
                    activeUsers = activeUsers.split('\n').map((userName) => { return userName.trim(); });
                    // limit max active chats
                    if (activeUsers.length >= MAX_ACTIVE_USERS) {
                        reject(new JsonRPCError(409, "Conflict"));
                        return;
                    }
                    randName().then((userName) => {
                        if (activeUsers.indexOf(userName) != -1) {
                            // if chat name is already taken restart research
                            keepResearching();
                        } else {
                            resolve(userName);
                        }
                    });
                });
            }();
        });
    };

    // append new message after the others
    return researchUserName().then((userName) => {
        return getFileContent(activeUsersPath).then(activeUsers => {
            activeUsers = JSON.parse(activeUsers);
            activeUsers[userName] = socket;
            fs.writeFileSync(activeUsersPath, JSON.stringify(activeUsers));
            return userName;
        })
    });
};