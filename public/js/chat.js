/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};
var key,
    publicKey,
    chatName,
    userName,
    chatLog = {
        spam: 0,
        messages: 0
    },
    chatClientHeight;

function init(done, err) {
    // init socket
    socket = io();

    // get key
    key = getKey();
    if (!key) {
        err('key');
        return;
    }
    publicKey = encrypt(key);

    // get chatName
    chatName = window.location.pathname;
    chatName = chatName.substring(0, chatName.lastIndexOf('/'));
    chatName = chatName.substring(chatName.lastIndexOf('/') + 1, chatName.length);
    document.querySelector("#info > h1").innerHTML = chatName;
    document.title = "shatapp@" + chatName;

    // start of asynchronous phase

    // get userName
    var request = new JsonRPCRequest('GET', { 'chatName': chatName }, 0);
    socket.emit("get_username", request, function receiveUsername(response) {
        if (!response['error']) {
            userName = response.result;
            document.getElementById("username").innerHTML = "<span>Username </span>" + userName;

            // get initial chat content
            var request = new JsonRPCRequest('GET', { 'chatName': chatName }, 0);
            socket.emit("get_chat_content", request, function (response) {
                if (!response['error']) {
                    updateChat(response.result);

                    // register to socket events
                    socket.on('new_message', function onNewMessage(request) {
                        updateChat(request.params['msg']);
                    })
                    socket.on('chat_deleted', function onChatDeleted(request) {
                        alert('chat gone');
                        window.location.href = '/';
                    })

                    done();
                } else {
                    err('chat_content')
                }
            });

        } else {
            err('username');
        }
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
        "<username>" + encrypt(userName) + "</username>" +
        "<publicKey>" + publicKey + "</publicKey>" +
        "<content>" + encrypt(msg) + "</content>" +
        "</message>";
}

/**
 * 
 * 
 * @param {any} element 
 * @param {any} to 
 * @param {any} duration 
 * @returns 
 */
function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function () {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop == to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
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
            if (publicKeyToCheck == publicKey) {
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
    chatLog.spam += spam;
    chatLog.messages += messages.length;
    // update chatLog graphics
    document.getElementById("spam-count").innerHTML = "<span>Spam </span>" + chatLog.spam + "/" + chatLog.messages;
    // scroll to last message
    var chatScrollHeight = $chat_messages.scrollHeight;
    if ($chat_messages.scrollTop == 0) {
        // only if it's the first time chat update then animate it from a decent initial point
        var chatStartHeight = (chatScrollHeight > chatClientHeight) ? chatClientHeight : chatScrollHeight - 200;
        $chat_messages.scrollTop = chatStartHeight;
    }
    // scroll to bottom of the messages
    // scrollTo($chat_messages, chatScrollHeight, 2000);

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
        'chatName': chatName
    };
    var request = new JsonRPCRequest('POST', params, 0);
    socket.emit('send_message', request, function messageSent(response) {
        if (!response['error']) {
        } else {
        }
    })

}

// DOCUMENT READY
var documentReady = function () {

    // bind enter key pressed to send button
    document.getElementById("input").onkeypress = function (e) {
        if (e.which == 13) {
            e.preventDefault();
            document.querySelector("#chat-input > button").click();
        }
    };

    // focus cursor on input box
    document.querySelector("#chat-input > #input").focus();

    // get chat messages client height
    chatClientHeight = document.getElementById('chat-messages').clientHeight;

    // init
    init(function done() {
    }, function err(cause) {
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