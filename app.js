var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pippo = require('./actions/actions');
console.log(pippo);

app.use(express.static('public'));
app.use(express.static('chats'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});

// socket.io
io.on('connection', function (socket) {
    socket.on('create_chat', function (request, response) {
        console.log("create_chat > " + request);
        response("bravo");
    });
});

// server listen
http.listen(3000, function () {
    console.log('listening on *:3000');
});