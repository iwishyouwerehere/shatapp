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
serverProcesses = require('./server/');

// define global variables
var chatEmitter = emitters.chatEmitter;

// define sub processes
// create and manage checkChatLifecycle process
var p_checkChatLifecycle = child_process.fork(serverProcesses.checChatLifecycle, [], { execArgv: ['--debug=5859'] });
p_checkChatLifecycle.on('message', function onRemovedChat(chatName) {
    chatEmitter.emit('chat_deleted', chatName);
});
chatEmitter.on('create_chat', function sendToCheckChatLifecycle(chatName) {
    p_checkChatLifecycle.send(chatName);
});
// create and manage checkUsersActivity process
var p_checkUsersActivity = child_process.fork(serverProcesses.checkUsersActivity, [], { execArgv: ['--debug=5860'] });
p_checkUsersActivity.on('message', function onRemovedUser(removed) {
    // emit user_leaved event
    chatEmitter.emit('user_leaved', { chatName: removed.chatName, userName: removed.userName });
    // remove username client by socket room (also check if it is no longer connected)
    if (io.sockets.connected[removed.socketId]) {
        io.sockets.connected[removed.socketId].leave(removed.chatName);
    }
});
chatEmitter.on('user_joined', function sendToCheckUsersActivity(info) {
    p_checkUsersActivity.send({ event: 'user_joined', data: info });
});
chatEmitter.on('user_active', function sendToCheckUsersActivity(info) {
    p_checkUsersActivity.send({ event: 'user_active', data: info });
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
chatEmitter.on('user_joined', function (info) {
    io.to(info.chatName).emit('user_joined', new JsonRPCRequest('SEND', { userName: userName }));
});
chatEmitter.on('user_leaved', function (info) {
    io.to(info.chatName).emit('user_leaved', new JsonRPCRequest('SEND', { userName: userName }));
});

// server listen
http.listen(process.env.PORT || 3000, '0.0.0.0',  function () {
    console.log('listening on *:' + (process.env.PORT || 3000 ));
});
