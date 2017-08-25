/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var key = undefined;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};


/**
 * 
 * 
 */
function init() {
    socket = io();

    // get saved key if there's one
    key = getKey();
    var $keyView = document.querySelector("#info p");
    if (key) {
        $keyView.innerHTML = key;
        setTimeout(function () { $keyView.style.opacity = 1; }, 0); // for style purpose only
    } else { $keyView.style.display = 'none'; }
}


/**
 * 
 * 
 */
function createChat() {
    var request = new JsonRPCRequest('POST', null, 0);

    socket.emit("create_chat", request, function (response) {
        if (!response['error']) {
            window.location.href = "/chats/" + response.result + "/chat.html";
        } else {
            Alerter.show('unknown');
        }
    });
}

function joinChat(chatName) {
    var request = new JsonRPCRequest('GET', { chatName: chatName }, 0);

    socket.emit("exist_chat", request, function (response) {
        console.log(response);
        if (!response['error']) {
            if (response.result) {
                window.location.href = "/chats/" + chatName + "/chat.html";
            } else {
                Alerter.show('wrong_chatName');
            }
        } else {
            Alerter.show('unknown');
        }
    });
}

/**
 * Access achat service and save locally the key.
 * Accepted parameters: join, create
 * 
 * @param {string} type 
 */

function access(type) {
    // get key value and set it
    var $inputKey = document.querySelector("form input");
    var chatName = $inputKey.value;
    setTimeout(function () { $inputKey.value = "" }, 0); // for style purpose only

    // switch based on access type
    switch (type) {
        case 'join': {
            // check if chat exist
            if (chatName) {
                joinChat(chatName);
            }
            break;
        }
        case 'create': {
            $inputKey.blur();
            createChat();
            break;
        }
    }
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
 * Set locally the given key
 * 
 * @param {any} key
 */
function setKey(key) {
    this.key = key;
    if (typeof (Storage) !== "undefined") {
        sessionStorage.setItem("key", key);
    }
}
/**
 * Remove locally saved private key
 * 
 * @returns {boolean} if browser supports storage
 */
function removeKey() {
    this.key = undefined;
    if (typeof (Storage) !== "undefined") {
        sessionStorage.removeItem("key");
        return true;
    }

    return false;
}

// DOCUMENT READY
var documentReady = function () {

    // bind Alerter object to dom elements
    console.log("alert", Alerter);
    Alerter.init(document.getElementById("alert"),
        {
            'edit_key': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Manage key";
                    Alerter.$text.innerHTML = "Here you can change your key with a new one";
                    Alerter.$input.style.display = "block";
                    Alerter.$input.value = key;
                    Alerter.$button.innerHTML = "Save edit";
                },
                onClose: function (data) {
                    setKey(data);
                    var $keyView = document.querySelector("#info p");
                    $keyView.innerHTML = key;
                }
            },
            'wrong_chatName': {
                onShow: function () {
                    Alerter.$title.innerHTML = "Chat don't exist... yet";
                    Alerter.$text.innerHTML = "The chat name you entered doesn't correspond to anything on our servers. Please retry";
                    Alerter.$button.innerHTML = "Continue";
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

    // init
    init();

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
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
