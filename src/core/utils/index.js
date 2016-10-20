var lang = require('./lang')
var date = require('./date')
var browser = require('./browser')
var dom = require('./dom')

module.exports = lang.extend({}, lang, date, browser, dom)
