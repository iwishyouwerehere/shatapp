var getFileContent = require('./getFileContent.js'),
    filePath = './resources/dictionary.txt';

module.exports = function generateRandName() {

    return getFileContent(filePath).then(data => {
        let names = data.split('\n');
        let name = names[Math.floor(Math.random() * names.length)];
        return name.trim();
    });
};