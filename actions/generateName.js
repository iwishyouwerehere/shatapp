var fs = require('fs'),
    path = require('path'),
    filePath = path.join(__dirname, '/resources/dictionary.txt');

export default function () {

    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            var names = data.split('\n');
            console.log(names[0] + " " + names[1]);
        } else {
            console.log(err);
        }
    });
};