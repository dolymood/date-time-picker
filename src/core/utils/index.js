var lang = require('./lang')
var date = require('./date')
var browser = require('./browser')

module.exports = lang.extend({}, lang, date, browser)
