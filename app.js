// define module imports
var express = require('express'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    child_process = require('child_process'),
    routes = require('./routes/')(app), // defined routes
    // middlewares = require('./routes/middlewares/')(app),
    events = require('./events/'),
    emitters = require('./resources/emitters/');

// define global varibles
var checkChatLifecyclePath = './server/checkChatLifecycle.js';
var chatEmitter = emitters.chatEmitter;

// define static content
app.use(express.static('public'));

// define routes (by require)

// define socket.io
io.on('connection', function (socket) {
    socket.on('create_chat', events.createChat);
});

// server listen
http.listen(3000, function () {
    console.log('listening on *:3000');
});

// create and manage checkChatLifecycle process
var p_checkChatLifecycle = child_process.fork(checkChatLifecyclePath, [], { execArgv: ['--debug=5859'] });
chatEmitter.on('create_chat', function sendToCheckChatLifecycle(chatName) {
    p_checkChatLifecycle.send(chatName);
});