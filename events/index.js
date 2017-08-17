module.exports = function initEvents(socket) {
    return {
        // external per socket events
        createChat: require('./createChat.event')(socket),
        sendMessage: require('./sendMessage.event')(socket),
        getUsername: require('./getUsername.event')(socket),
        getChatContent: require('./getChatContent.event')(socket)
    }
}
