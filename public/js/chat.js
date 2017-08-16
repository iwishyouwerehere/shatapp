/*  GLOBAL VARIABLES DECLARATION   */

var socket;
var JsonRPCRequest = function JsonRPCRequest(method, params = null, id = null) {
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
    this.id = id;
};

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