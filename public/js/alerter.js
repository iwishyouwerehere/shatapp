function generateAlertElements() {
    // create elements
    Alerter.$form = document.createElement("FORM");
    Alerter.$form.addEventListener("submit", function (e) {
        e.preventDefault();
    });

    Alerter.$loading = document.createElement("i");
    Alerter.$loading.classList.add('ion-load-c');
    var span = document.createElement("span");
    span.innerHTML = "Loading...";
    Alerter.$loading.appendChild(span);

    Alerter.$alertInfo = document.createElement("DIV");

    Alerter.$title = document.createElement("h1");

    Alerter.$text = document.createElement("p");

    Alerter.$input = document.createElement("input");
    Alerter.$input.setAttribute('type', 'text');
    Alerter.$input.setAttribute('required', 'true');

    Alerter.$button = document.createElement("BUTTON");
    Alerter.$button.setAttribute('onclick', "Alerter.close()");

    // append elements
    Alerter.$e.appendChild(Alerter.$form);
    Alerter.$form.appendChild(Alerter.$loading);
    Alerter.$form.appendChild(Alerter.$alertInfo);
    Alerter.$alertInfo.appendChild(Alerter.$title);
    Alerter.$alertInfo.appendChild(Alerter.$text);
    Alerter.$alertInfo.appendChild(Alerter.$input);
    Alerter.$form.appendChild(Alerter.$button);
}

var Alerter = {
    $e: null,
    $form: null,
    $alertInfo: null,
    $title: null,
    $text: null,
    $input: null,
    $button: null,
    $loading: null,
    timeouts: {
        onShow: null,
        onClose: null
    },
    actions: null,
    stack: [],
    init: function (alert, actions) {
        if (!(alert instanceof HTMLElement && actions)) { return false; }
        this.actions = actions;
        this.$e = alert;
        generateAlertElements();
        return true;
    },
    show: function showAlert(type) {
        this.stack.push({ type: type });
        if (this.timeouts.onClose) { clearTimeout(this.timeouts.onClose); }
        this.$form.style.opacity = 0;
        this.timeouts.onShow = setTimeout(function () {
            this.reset();
            if (type != "loading") {
                this.actions[type].onShow();
            } else {
                this.$form.classList.add('small');
                this.$button.style.display = "none";
                this.$loading.style.opacity = 1;
                this.$loading.style.display = "block";
            }
            this.$form.style.opacity = 1;
        }.bind(this), 200);

        this.$button.setAttribute("data-type", type);
        this.$e.style.visibility = "visible";
        this.$e.style.opacity = 1;
    },
    close: function closeAlert(force) {
        // check onShow timeout
        if (this.timeouts.onShow) { clearTimeout(this.timeouts.onShow); }
        // get the input value if needed
        var data;
        var display = this.$input.style.display ? this.$input.style.display : getComputedStyle(this.$input, null).display;
        if (this.$input && display != "none") {
            // get data of the input elemente if there's one
            console.log(this.$input.style.display);
            data = this.$input.value;
            // return if value is empty
            if (!data) { return; }
        }
        // manage stack on closing
        if (this.stack.length == 0) { return; }
        if (force) { this.stack = []; console.log('resettato'); }
        else { this.stack.pop(); }
        // check for alert type and run the type-specific function
        var type = this.$button.getAttribute("data-type");
        if (type != "loading" && !force) {
            this.actions[type].onClose(data);
        } else {
            this.$loading.style.opacity = 0;
        }
        // graphically close the alert
        this.$form.style.opacity = 0;
        this.$e.style.opacity = 0;
        this.timeouts.onClose = setTimeout(function () {
            this.$e.style.visibility = "hidden";
            this.reset();
        }.bind(this), 200); // for style purpose only
    },
    reset: function resetAlert() {
        this.$title.innerHTML = "";
        this.$text.innerHTML = "";
        this.$button.innerHTML = "";
        this.$button.style.display = "block";
        this.$input.style.display = "none";
        this.$loading.style.display = "none";
        this.$form.classList.remove('small');
    }
}