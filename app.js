// define module imports
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var actions = require('./actions/');
console.log("actions", actions);
console.log("actions > createChat", actions.createChat());
var events = require('./events/');
console.log("events", events);
var JsonRPCResponse = require('./resources/tools/jsonrpc');

// define static content
app.use(express.static('public'));
app.use(express.static('chats'));

// define routes
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});

// define socket.io
io.on('connection', function (socket) {
    socket.on('create_chat', function (request, response) {
        actions.createChat().then((data) => {
            response(new JsonRPCResponse({ result: data }));
        }).catch((err) => {
            response(new JsonRPCResponse({ error: err }));
        });
    });
});

// server listen
http.listen(3000, function () {
    console.log('listening on *:3000');
});