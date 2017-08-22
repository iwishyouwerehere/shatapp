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
        }
    })
}

/**
 * Access achat service and save locally the key.
 * Accepted parameters: join, create
 * 
 * @param {string} type 
 */

function access(type) {
    // get key value and set it
    var $inputKey = document.querySelector("form > input");
    var key = $inputKey.value;
    setTimeout(function () { $inputKey.value = "" }, 0); // for style purpose only

    // switch based on access type
    switch (type) {
        case 'join':
            // check if chat exist
            break;
        case 'leave':
            removeKey();
            var $keyView = document.querySelector("#info > p");
            $keyView.style.opacity = 0;
            setTimeout(function () { $keyView.innerHTML = ""; }, 200);
            break;
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
 * Remove locally saved private key
 * 
 * @returns {boolean} if browser supports storage
 */
function removeKey() {
    this.key = undefined;
    document.dispatchEvent(keyChangeEvent);
    if (typeof (Storage) !== "undefined") {
        sessionStorage.removeItem("key");
        return true;
    }

    return false;
}

// DOCUMENT READY
var documentReady = function () {

    // init
    init();

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
    });

    // get saved key if there's one
    setKey(getKey());
    if (key) {
        var $keyView = document.querySelector("#info > p");
        $keyView.style.opacity = 1;
        setTimeout(function () { $keyView.innerHTML = ""; }, 200);
        var $form = document.getElementsByTagName("form")[0];
        $form.innerHTML += '<button id="button-join" onclick="access(\'join\')">Join chat</button>';
    }

    // bind to key input change event
    document.querySelector("form > input").onkeyup = function (e) {
        if (e && e.target.value != "") {
            if (key) {
                document.querySelector("form > #button-join").innerHTML = "Change key";
            }
        } else if (key) {
            document.querySelector("form > #button-join").innerHTML = "Leave";
        }
    }.bind(this);


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
