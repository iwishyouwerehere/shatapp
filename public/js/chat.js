/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};
var initProcess;
var client = {
    key: '',
    publicKey: '',
    userName: ''
},
    chat = {
        name: '',
        users: {},
        spam: 0,
        messages: 0
    }

/*  EXECUTION   */

function init() {
    // init socket
    socket = io();

    // get chatName
    chat.name = window.location.pathname;
    chat.name = chat.name.substring(0, chat.name.lastIndexOf('/'));
    chat.name = chat.name.substring(chat.name.lastIndexOf('/') + 1, chat.name.length);
    document.title = "shatapp@" + chat.name;
    document.getElementById("chat-info").getElementsByTagName("h2")[0].innerHTML = "#" + chat.name;

    // get key
    client.key = getKey();
    if (!client.key) {
        return Promise.reject('key_not_found');
    }
    var $keyView = document.querySelector("#info > p");
    $keyView.innerHTML = client.key;
    $keyView.style.opacity = 1;
    client.publicKey = encrypt(client.key);

    // start of asynchronous phase
    var requestPromises = [];

    // get userName
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        socket.emit("get_username", request, function receiveUsername(response) {
            console.log(response);
            if (!response['error']) {
                client.userName = response.result;
                resolve();
            } else {
                reject('username_error');
            }
        });
    }))
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        socket.emit("get_chat_content", request, function (response) {
            if (!response['error']) {
                updateChat(response.result);
                resolve();
            } else {
                reject('chat_content')
            }
        });
    }));

    return Promise.all(requestPromises).then(function registerSocketEvents() {
        // register to socket events
        socket.on('new_message', function onNewMessage(request) {
            updateChat(request.params['msg']);
        });
        socket.on('chat_deleted', function onChatDeleted(request) {
            Alerter.show('chat_gone');
        });
        socket.on('user_joined', function onUserJoined(request) {
            chat.users[request.params.userName] = { color: getRandomColor() };
            updateUsersList();
        });
        socket.on('user_leaved', function onUserLeaved(request) {
            delete chat.users[request.params.userName];
            updateUsersList();
        });
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Get locally saved private key if present
 * 
 * @returns {string|undefined} key if found or undefined otherwise
 */
function getKey() {
    if (typeof (Storage) !== "undefined") {
        return sessionStorage.getItem("key");
    }
    return client.key;
}

/**
 * Set locally the given key
 * 
 * @param {any} key
 */
function setKey(key) {
    client.key = key;
    client.publicKey = encrypt(key);
    if (typeof (Storage) !== "undefined") {
        sessionStorage.setItem("key", key);
    }
}

/**
 * Get data string and decrypt it with private key
 * 
 * @param {string} data
 * @returns {string} data decrypted
 */
function decrypt(data) {
    return data;
}

/**
 * Get data string and encrypt it with private key
 * 
 * @param {string} data
 * @returns {string} data encrypted
 */
function encrypt(data) {
    return data;
}

/**
 * Get message to be sent then format it with xml
 * i.e.
 * "hello" -> <message>
 *              <username>user</username>
 *              <publicKey>publicKey</publicKey>
 *              <content>hello</content>
 *            </message>
 * 
 * @param {string} msg
 * @returns 
 */
function formatMsg(msg) {
    return "<message>" +
        "<username>" + encrypt(client.userName) + "</username>" +
        "<publicKey>" + client.publicKey + "</publicKey>" +
        "<content>" + encrypt(msg) + "</content>" +
        "</message>";
}

/**
 * 
 * 
 * @param {Array} messages
 */
function updateChat(messages) {
    var $chat_messages = document.getElementById('chat-messages'),
        oParser = new DOMParser(),
        spam = 0;
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.map(function appendMessage(msg) {
        // needs to decrypt message
        if (msg) {
            var $last_chat_message = $chat_messages.lastChild;
            var $xml = oParser.parseFromString(msg, "text\/xml");
            var publicKeyToCheck = $xml.getElementsByTagName("publicKey")[0].innerHTML;
            if (publicKeyToCheck == client.publicKey) {
                var username = decrypt($xml.getElementsByTagName("username")[0].innerHTML);
                var text = decrypt($xml.getElementsByTagName("content")[0].innerHTML);

                if ($last_chat_message && $last_chat_message.getElementsByTagName("h4")[0].innerHTML == username) {
                    // append on last message
                    $last_chat_message.innerHTML += '<p>' + text + '</p>';
                } else {
                    // append new message
                    var color = (chat.users[username]) ? chat.users[username].color : '#495ece';
                    $chat_messages.innerHTML += ('<div class="chat-message"><h4 style="color: ' + color + ';">' + username + '</h4><p>' + text + '</p></div>');
                }
            } else {
                spam++;
            }
        }
    })

    // update chatLog
    chat.spam += spam;
    chat.messages += messages.length;
    // update chatLog graphics
    // document.getElementById("spam-count").innerHTML = "<span>Spam </span>" + chat.spam + "/" + chat.messages;
}

/**
 * 
 * 
 * @returns 
 */
function sendMsg() {
    var $input = document.getElementById("input");
    var msg = $input.value.trim();
    if (msg == "") { return; }
    $input.value = "";
    $input.focus();

    msg = formatMsg(msg);
    updateChat(msg);

    var params = {
        'msg': msg,
        'chatName': chat.name,
        'userName': client.userName
    };
    var request = new JsonRPCRequest('POST', params, 0);
    socket.emit('send_message', request, function messageSent(response) {
        if (!response['error']) {
        } else {
            Alerter.show('unknown');
        }
    })

}

// DOCUMENT READY
var documentReady = function () {

    // bind Alerter object to dom elements
    console.log("alert", Alerter);
    Alerter.init(document.getElementById("alert"),
        {
            'key_not_found': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Insert a key";
                    Alerter.$text.innerHTML = "In order to send messages in a chatroom you have to create a private key to crypt your messages. We care about your privacy!";
                    Alerter.$button.innerHTML = "Set key";
                    Alerter.$input.style.display = "block";
                },
                onClose: function (data) {
                    setKey(data);
                    initProcess();
                }
            },
            'username_error': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Username error";
                    Alerter.$text.innerHTML = "There has been an error retrieving a random username for you. We're sorry :(";
                    Alerter.$button.innerHTML = "Retry";
                },
                onClose: function (data) {
                    initProcess();
                }
            },
            'chat_gone': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Chat gone";
                    Alerter.$text.innerHTML = "The chat lifetime has ended up here. Nice to see you last so long! Grab your things and come back chatting!";
                    Alerter.$button.innerHTML = "Go to homepage";
                },
                onClose: function (data) {
                    window.location.href = '/';
                }
            },
            'edit_key': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Manage key";
                    Alerter.$text.innerHTML = "Here you can change your key with a new one";
                    Alerter.$input.style.display = "block";
                    Alerter.$input.value = client.key;
                    Alerter.$button.innerHTML = "Save edit";
                },
                onClose: function (data) {
                    setKey(data);
                    var $keyView = document.querySelector("#info > p");
                    $keyView.innerHTML = client.key;
                }
            },
            'unknown': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Unknown Error";
                    Alerter.$text.innerHTML = "We don't know what happened D:<br>Try reloading the page!";
                    Alerter.$button.innerHTML = "Reload";
                },
                onClose: function (data) {
                    window.location.reload();
                }
            }
        });
    Alerter.show('loading');

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
    });

    // bind enter key pressed to send button
    document.getElementById("input").onkeypress = function (e) {
        if (e.which == 13) {
            e.preventDefault();
            document.querySelector("#chat-input > button").click();
        }
    };

    // focus cursor on input box
    document.querySelector("#chat-input > #input").focus();

    // init
    initProcess = function () {
        return init().then(function () {
            console.log('init success');
            Alerter.close(true);
        }).catch(function err(cause) {
            console.log(cause);
            switch (cause) {
                case 'key_not_found': {
                }
                case 'username_error': {
                }
                case 'chat_content': {
                    console.log(this);
                    Alerter.show(cause);
                    break;
                }
                default: {
                    Alerter.show('unknown');
                }
            }
        });
    };
    initProcess();


}.bind(this);


// START JS EXECUTION WHEN DOCUMENT IS READY
if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    documentReady();
} else {
    document.addEventListener("DOMContentLoaded", documentReady);
}