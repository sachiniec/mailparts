/*
*  Example to break mail into objects and reform mail from parts
*/


console.log('***** view in http://www.jsbeautifier.org ******');
console.log();
console.log('****** break mail into parts *****');
console.log();
console.log();

var mailparts = require('../index.js');
var fs = require('fs');

var mailbody = fs.readFileSync('mail.txt').toString();
var boundary = '__slack_1274536647__';

var parts = mailparts.breakMail(boundary, mailbody);

console.log(JSON.stringify(parts));

console.log();
console.log();
console.log('****** reform broken parts *****');

var reformed = mailparts.reFormMail(parts , boundary);
console.log(reformed);