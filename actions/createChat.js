var fs = require('fs');
var dir = '';

module.exports = function () {

    // randomly generate chat name

    // check if chat name is already taken
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};