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

/**
 * Execute all dom related initializing actions
 * 
 */
function domInit() {
    // init Alerter and show loading
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
                    client.key = data;
                    StorageWrap.session.setItem('key', data);
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
                    client.key = data;
                    StorageWrap.session.setItem('key', data);
                    var $keyView = document.querySelector("#info > p");
                    $keyView.innerHTML = client.key;
                }
            },
            'help': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Let us help you";
                    Alerter.$text.innerHTML = "This is a chat room. You can write, anyone can write, only people with the same key as you can understand your messages.<br>Want to <a href=\'https://github.com/kristiannotari/shatapp\'>read more</a> ?";
                    Alerter.$button.innerHTML = "Understood";
                },
                onClose: function (data) {
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
}
    
/**
 * Execute all actions related to initialize the chat service with socket requests to server and listening for socket events
 * 
 * @returns <Promise<string>> return a promise that will resolve when all socket requests are ended succesfully, reject otherwise
 */
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
    client.key = StorageWrap.session.getItem('key');
    if (!client.key) {
        return Promise.reject('key_not_found');
    }
    var $keyView = document.querySelector("#info > p");
    $keyView.innerHTML = client.key;
    $keyView.style.opacity = 1;
    client.publicKey = Encryptor.encrypt(client.key);

    // start of asynchronous phase
    var requestPromises = [];

    // get userName
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        socket.emit("get_username", request, function receiveUsername(response) {
            if (!response['error']) {
                client.userName = response.result;
                resolve();
            } else {
                reject('username_error');
            }
        });
    }));
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
            chat.users[request.params.userName] = { color: StyleTools.getRandomColor() };
        });
        socket.on('user_leaved', function onUserLeaved(request) {
            delete chat.users[request.params.userName];
        });
    });
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
        "<username>" + Encryptor.encrypt(client.userName) + "</username>" +
        "<publicKey>" + client.publicKey + "</publicKey>" +
        "<content>" + Encryptor.encrypt(msg) + "</content>" +
        "</message>";
}

/**
 * Update chat messages graphically
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
                var username = Encryptor.decrypt($xml.getElementsByTagName("username")[0].innerHTML);
                var text = Encryptor.decrypt($xml.getElementsByTagName("content")[0].innerHTML);

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
    // missing
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

    // init dom
    domInit();

    // init
    initProcess = function () {
        return init().then(function () {
            Alerter.close(true);
        }).catch(function err(cause) {
            switch (cause) {
                case 'key_not_found': {
                }
                case 'username_error': {
                }
                case 'chat_content': {
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