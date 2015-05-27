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

var mailbody = fs.readFileSync('mail_3_boundary.txt').toString();
var boundary = '------------060801020309040206010708';

var parts = mailparts.breakMail(boundary, mailbody);
console.log(JSON.stringify(parts));

var parts = mailparts.breakMail(boundary, mailbody);

console.log(JSON.stringify(parts));

console.log();
console.log();
console.log('****** reform broken parts *****');

var reformed = mailparts.reFormMail(parts , boundary);
console.log(reformed);