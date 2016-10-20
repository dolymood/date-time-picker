var each = require('./lang').each

var doc = document
function createElement (tagName, props, attrs) {
  var ele = doc.createElement(tagName)
  if (props) {
    each(props, function (v, k) {
      ele[k] = v
    })
  }
  if (attrs) {
    each(attrs, function (v, k) {
      ele.setAttribute(k, v)
    })
  }
  return ele
}
module.exports = {
  createElement: createElement
}
