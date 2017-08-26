var StorageWrap = {
    session: {
        /**
         * Set item
         * 
         * @param {any} key 
         * @param {any} value 
         * @returns {boolean} return true if session storage is available, false, otherwise
         */
        setItem: function (key, value) {
            if (typeof (Storage) === "undefined") { return false; }
            sessionStorage.setItem(key, value);
            return true;
        },
        /**
         * Get item
         * 
         * @param {any} key 
         * @returns 
         */
        getItem: function (key) {
            if (typeof (Storage) === "undefined") { return; }
            return sessionStorage.getItem(key);
        },
        /**
         * Remove item
         * 
         * @param {any} key 
         * @returns 
         */
        removeItem: function (key) {
            if (typeof (Storage) === "undefined") { return false; }
            sessionStorage.removeItem("key");
            return true;
        }
    }
}
