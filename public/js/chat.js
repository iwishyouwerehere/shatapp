/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};
var client = {
    key: '',
    publicKey: '',
    userName: ''
    },
    chat = {
        name: '',
        users: [],
        spam: 0,
        messages: 0
    };

function showAlert(type) {
    var $alert = document.getElementById('alert');
    var $alertInfo = document.getElementById('alert-info');
    var $title = $alert.getElementsByTagName("h1")[0];
    var $text = $alert.getElementsByTagName("p")[0];
    var $button = $alert.getElementsByTagName("button")[0];

    switch (type) {
        case 'key_not_found': {
            $title.innerHTML = "Key not found";
            $text.innerHTML = "Please insert a new key";
            $button.innerHTML = "Set key";
            $alertInfo.innerHTML += '<input type="text" placeholder="key" onfocus="this.placeholder = \'\'" onblur="this.placeholder = \'key\'" required>'
        }
    }

    $alert.style.display = "block";
    $alert.style.opacity = 1;
}

function closeAlert() {
    
}

function init() {
    // init socket
    socket = io();

    // get key
    client.key = getKey();
    if (!client.key) {
        showAlert('key_not_found');
    }
    client.publicKey = encrypt(client.key);

    // get chatName
    chat.name = window.location.pathname;
    chat.name = chat.name.substring(0, chat.name.lastIndexOf('/'));
    chat.name = chat.name.substring(chat.name.lastIndexOf('/') + 1, chat.name.length);
    document.querySelector("#info > h1").innerHTML = chat.name;
    document.title = "shatapp@" + chat.name;

    // start of asynchronous phase
    var requestPromises = [];

    // get userName
    requestPromises.push(new Promise(function executor(resolve, reject) {
        var request = new JsonRPCRequest('GET', { 'chatName': chat.name }, 0);
        socket.emit("get_username", request, function receiveUsername(response) {
            if (!response['error']) {
                userName = response.result;
                document.getElementById("username").innerHTML = "<span>Username </span>" + userName;
                resolve();
            } else {
                reject('username');
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
        })
        socket.on('chat_deleted', function onChatDeleted(request) {
            alert('chat gone');
            window.location.href = '/';
        })
        socket.on()
    });
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
    return;
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

                if ($last_chat_message && $last_chat_message.getElementsByTagName("h6")[0].innerHTML == username) {
                    // append on last message
                    $last_chat_message.innerHTML += '<p>' + text + '</p>';
                } else {
                    // append new message
                    $chat_messages.innerHTML += ('<div class="chat-message"><h6>' + username + '</h6><p>' + text + '</p></div>');
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
    document.getElementById("spam-count").innerHTML = "<span>Spam </span>" + chat.spam + "/" + chat.messages;
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
            alert(response.error);
        }
    })

}

// DOCUMENT READY
var documentReady = function () {

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
    init().then(function () {
        console.log('init success');
    }).catch(function err(cause) {
        switch (cause) {
            case 'key': {
                alert('key error');
                break;
            }
            case 'username': {
                alert('username error');
                break;
            }
            case 'chat_content': {
                alert('get chat content error');
                break;
            }
            default: {
                alert('Generic internal error. Please retry');
            }
        }
    });

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