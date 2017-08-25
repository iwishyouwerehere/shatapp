// define module imports
var express = require('express'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    child_process = require('child_process'),
    routes = require('./routes/')(app), // defined routes
    events = require('./events/'),
    emitters = require('./resources/emitters/'),
    JsonRPCRequest = require('./resources/types/jsonrpc').request;

// define global varibles
var checkChatLifecyclePath = './server/checkChatLifecycle.js';
var chatEmitter = emitters.chatEmitter;

// define sub processes
// create and manage checkChatLifecycle process
var p_checkChatLifecycle = child_process.fork(checkChatLifecyclePath, [], { execArgv: ['--debug=5859'] });
p_checkChatLifecycle.on('message', function onRemovedChat(chatName) {
    chatEmitter.emit('chat_deleted', chatName);
});
chatEmitter.on('create_chat', function sendToCheckChatLifecycle(chatName) {
    p_checkChatLifecycle.send(chatName);
});

// define static content
app.use(express.static('public'));

// define routes (by require)

// define socket.io external events
io.on('connection', function (socket) {
    let socketEvents = events(socket);
    socket.on('create_chat', socketEvents.createChat);
    socket.on('send_message', socketEvents.sendMessage);
    socket.on('get_username', socketEvents.getUsername);
    socket.on('get_chat_content', socketEvents.getChatContent);
    socket.on('exist_chat', socketEvents.existChat);
});
// define socket.io internal events
chatEmitter.on('chat_deleted', function (chatName) {
    io.to(chatName).emit('chat_deleted', new JsonRPCRequest('SEND', { chatName: chatName }));
});

// server listen
http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:' + (process.env.PORT || 3000 ));
});
