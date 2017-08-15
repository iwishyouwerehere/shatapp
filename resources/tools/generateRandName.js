var getFileContent = require('./getFileContent.js'),
    filePath = './resources/dictionary.txt';

module.exports = function () {

    return getFileContent(filePath).then(data => {
        var names = data.split('\n');
        var name = names[Math.floor(Math.random() * names.length)];
        return name;
    });
};