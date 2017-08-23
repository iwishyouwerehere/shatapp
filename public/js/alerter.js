var Alerter = {
    $e: null,
    $form: null,
    $alertInfo: null,
    $title: null,
    $text: null,
    $input: null,
    $button: null,
    $loading: null,
    timeout: null,
    actions: null,
    init: function (alert, actions) {
        if (!(alert instanceof HTMLElement && actions)) { return false; }
        this.actions = actions;
        this.$e = alert;
        this.$form = this.$e.getElementsByTagName('form')[0];
        this.$alertInfo = this.$e.getElementsByTagName('div')[0];
        this.$title = this.$e.getElementsByTagName("h1")[0];
        this.$text = this.$e.getElementsByTagName("p")[0];
        this.$input = this.$e.getElementsByTagName("input")[0];
        this.$button = this.$e.getElementsByTagName("button")[0];
        this.$loading = this.$e.getElementsByTagName("i")[0];
        return true;
    },
    show: function showAlert(type) {
        if (this.timeout) { clearTimeout(this.timeout); }
        this.$form.style.opacity = 0;
        setTimeout(function () {
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
        this.$e.style.display = "block";
        this.$e.style.opacity = 1;
    },
    close: function closeAlert() {
        var $input = this.$e.querySelector("input");
        var data;
        if ($input) {
            data = $input.value;
        }
        var type = this.$button.getAttribute("data-type");
        if (type != "loading") {
            this.actions[type].onClose(data);
        } else {
            this.$loading.style.opacity = 0;
        }

        this.$e.style.opacity = 0;
        if ($input) {
            this.$e.querySelector("form").querySelector("div").removeChild($input);
        }
        this.timeout = setTimeout(function () {
            this.$e.style.display = "none";
            this.$loading.style.display = "none";
            this.$button.style.display = "block";
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