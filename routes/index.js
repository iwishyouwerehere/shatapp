var path = require('path');


module.exports = function (app) {
    require('./index.route')(app);
    require('./chat.route')(app);

    
}