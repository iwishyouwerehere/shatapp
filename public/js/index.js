/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var key = undefined;
var keyChangeEvent = new Event('keyChangeEvent');
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};


function init() {
    socket = io();
}


function createChat() {
    var request = new JsonRPCRequest('POST', null, 0);
    console.info("create_chat request", request);
    
    socket.emit("create_chat", request, function (response) {
        if (!response['err']) {
            console.info("create_chat response result", response);
            window.location.href = "/chats/" + response.result + "/chat.html";
        } else {
            console.error("create_chat response error", response);
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
    var e_inputKey = document.querySelector("form > input");
    var key = e_inputKey.value;
    setTimeout(function () { e_inputKey.value = "" }, 0); // for style purpose only
    if (type == "create") { document.removeEventListener('keyChangeEvent', keyChangeEvent); }
    if (key && !setKey(key)) {
        alert("your browser don't allows storage");
        return;
    }

    // switch based on access type
    switch (type) {
        case 'join':
            if (key) {
                setKey(key);
            } else {
                removeKey();
            }
            break;
        case 'create':
            if (this.key) {
                createChat();
            }
            break;
    }
}

/**
 * Save locally the private key
 * 
 * @param {string} key
 * @returns {boolean} if browser supports storage
 */
function setKey(key) {
    if (key) {
        this.key = key;
        document.dispatchEvent(keyChangeEvent);
        if (typeof (Storage) !== "undefined") {
            sessionStorage.setItem("key", key);
            return true;
        }
    }

    return false;
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

/**
 * Event handler for key change event.
 * Edit style of index.html according to user key presence
 * 
 */
function keyChanged() {
    var e_keyView = document.querySelector("#info > p");
    var e_form = document.querySelector("form");
    if (key) {
        e_keyView.innerHTML = key;
        e_keyView.style.opacity = 1;
        e_form.querySelector("input").required = false;
        e_form.querySelector("#button-join").innerHTML = "Leave";
    } else {
        e_keyView.style.opacity = 0;
        setTimeout(function () { e_keyView.innerHTML = ""; }, 200);
        setTimeout(function () { e_form.querySelector("input").required = true; }, 0); // for style purpose only
        e_form.querySelector("#button-join").innerHTML = "Join chat";
    }
}



// DOCUMENT READY
var documentReady = function () {

    // init
    init();

    // prevent form from submitting
    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
    });

    // get saved key if there's one and bind page to keyChangeEvent
    document.addEventListener('keyChangeEvent', keyChanged.bind(this));
    setKey(getKey());
    document.dispatchEvent(keyChangeEvent);


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
