var prot = Object.prototype

function typeEqual (obj, type) {
  return prot.toString.call(obj) === '[object ' + type + ']'
}

function isFn (obj) {
  return typeEqual(obj, 'Function')
}

function isStr (obj) {
  return typeEqual(obj, 'String')
}

function isNum (obj) {
  return typeEqual(obj, 'Number')
}

function isObj (obj) {
  return typeEqual(obj, 'Object')
}

function isArray (obj) {
  return Array.isArray ? Array.isArray(obj) : typeEqual(obj, 'Array')
}

function isUndefined (obj) {
  return typeof obj === 'undefined'
}

function isDate (obj) {
  return typeEqual(obj, 'Date')
}

function each (obj, fn, context) {
  if (!obj || !isFn(fn)) {
    return
  }
  context = context || obj

  if (obj.length) {
    var i = 0
    var l = obj.length
    for (; i < l; i++) {
      if (fn.call(context, obj[i], i, obj) === false) {
        return
      }
    }
  } else if (isObj(obj)) {
    for (var n in obj) {
      if (fn.call(context, obj[n], n, obj) === false) {
        return
      }
    }
  }
}

function noop () {}

function isPlainObject (obj) {
  if (!obj || !isObj(obj)) {
    return false
  }
  return 'isPrototypeOf' in obj
}

function extend () {
  var target = arguments[0] || {}
  var i = 1
  var length = arguments.length
  var deep = false
  var options
  var name
  var src
  var copy

  if (typeof arguments[0] === 'boolean') {
    deep = target
    target = arguments[1] || {}
    i = 2
  }
  if (typeof target !== 'object' && !isFn(target)) {
    target = {}
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name]
        copy = options[name]
        if (target === copy) {
          continue
        }
        if (deep && copy && (isPlainObject(copy) || isArray(copy))) {
          var clone = src && (isPlainObject(src) || isArray(src)) ? src : isArray(copy) ? [] : {}
          target[name] = extend(deep, clone, copy)
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }
  return target
}

function pad (val, len, cut) {
  if (len < 1) {
    return ''
  }
  if (typeof cut === 'undefined') {
    cut = true
  }
  val = '' + val
  var i = 0
  while (i < len) {
    val = '0' + val
    i += 1
  }
  i = val.length - len
  return val.substring(cut ? i : i > 0 ? len : i)
}

function set2Null (array, that) {
  array.forEach(function (v) {
    that[v] = null
  })
}

module.exports = {
  isFn: isFn,
  isStr: isStr,
  isNum: isNum,
  isObj: isObj,
  isArray: isArray,
  isDate: isDate,
  isUndefined: isUndefined,

  each: each,
  noop: noop,
  extend: extend,
  pad: pad,
  set2Null: set2Null
}
