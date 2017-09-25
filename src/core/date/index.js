var pad = require('../utils/lang').pad

var rrg = /(?:\b|%)([dDMyHhaAmsz]+|ap|AP)(?:\b|%)/g
var PARTS = {
  d: '([0-9][0-9]?)',
  dd: '([0-9][0-9])',
  M: '([0-9][0-9]?)',
  MM: '([0-9][0-9])',
  yyyy: '([0-9][0-9][0-9][0-9])',
  yyy: '([0-9][0-9])[y]',
  yy: '([0-9][0-9])',
  H: '([0-9][0-9]?)',
  hh: '([0-9][0-9])',
  h: '([0-9][0-9]?)',
  HH: '([0-9][0-9])',
  m: '([0-9][0-9]?)',
  mm: '([0-9][0-9])',
  s: '([0-9][0-9]?)',
  ss: '([0-9][0-9])',
  z: '([0-9][0-9]?[0-9]?)',
  zz: '([0-9][0-9]?[0-9]?)[z]',
  zzz: '([0-9][0-9][0-9])',
  ap: '([ap][m])',
  a: '([ap][m])',
  AP: '([AP][M])',
  A: '([AP][M])',
  '%': ''
}

function format (date, format) {
  var parts = {}
  var isAmPm = (format.indexOf('a') !== -1) || (format.indexOf('A') !== -1)
  var temp

  parts['d'] = date.getDate()
  parts['dd'] = pad(parts['d'], 2)
  temp = date.getDay()
  parts['D'] = temp
  parts['DD'] = temp
  parts['M'] = date.getMonth() + 1
  temp = parts['M']
  parts['MM'] = pad(temp, 2)
  parts['yyyy'] = date.getFullYear()
  temp = parts['yyyy']
  parts['yyy'] = pad(temp, 2) + 'y'
  parts['yy'] = pad(temp, 2)
  parts['y'] = 'y'
  parts['H'] = date.getHours()
  temp = parts['H']
  parts['hh'] = pad(isAmPm ? convertTo12Hour(temp) : temp, 2)
  parts['h'] = isAmPm ? convertTo12Hour(temp) : temp
  parts['HH'] = pad(temp, 2)
  temp = parts['H'] < 12
  parts['ap'] = temp ? 'am' : 'pm'
  parts['a'] = temp ? 'am' : 'pm'
  parts['AP'] = temp ? 'AM' : 'PM'
  parts['A'] = temp ? 'AM' : 'PM'
  parts['m'] = date.getMinutes()
  parts['mm'] = pad(parts['m'], 2)
  parts['s'] = date.getSeconds()
  parts['ss'] = pad(parts['s'], 2)
  parts['z'] = date.getMilliseconds()
  temp = parts['z']
  parts['zz'] = temp + 'z'
  parts['zzz'] = pad(temp, 3)

  return format.replace(rrg, function (match, $1) {
    var _ = parts[$1]
    return _ === undefined ? $1 : _
  })
}

function parse (strDate, format) {
  var parts = PARTS
  var regex = ''
  var i = 0
  var outputs = ['']
  var token = ''
  var tmp

  var ret = new Date()
  while (i < format.length) {
    token = format.charAt(i)
    while ((i + 1 < format.length) && parts[token + format.charAt(i + 1)] !== undefined) {
      token += format.charAt(++i)
    }
    if ((tmp = parts[token]) !== undefined) {
      if (tmp !== '') {
        regex += parts[token]
        outputs.push(token)
      }
    } else {
      regex += token
    }
    i++
  }
  regex = new RegExp(regex)
  var matches = strDate.match(regex)
  var len = outputs.length
  if (!matches || matches.length !== len) {
    return null
  }
  for (i = 0; i < len; i++) {
    if ((token = outputs[i]) !== '') {
      tmp = parseInt(matches[i], 10)
      switch (token) {
        case 'yyyy':
        case 'yyy':
          ret.setYear(tmp)
          break
        case 'yy':
          ret.setYear(2000 + tmp)
          break
        case 'MM':
        case 'M':
          ret.setMonth(tmp - 1)
          break
        case 'dd':
        case 'd':
          ret.setDate(tmp)
          break
        case 'hh':
        case 'h':
        case 'HH':
        case 'H':
          ret.setHours(tmp)
          break
        case 'mm':
        case 'm':
          ret.setMinutes(tmp)
          break
        case 'ss':
        case 's':
          ret.setSeconds(tmp)
          break
        case 'zzz':
        case 'zz':
        case 'z':
          ret.setMilliseconds(tmp)
          break
        case 'AP':
        case 'A':
        case 'ap':
        case 'a':
          ret.setHours(convertTo24Hour(ret.getHours(), matches[i]))
          break
      }
    }
  }
  return ret
}

module.exports = {
  format: format,
  parse: parse
}

function convertTo12Hour (h) {
  return h % 12 === 0 ? 12 : h % 12
}

function convertTo24Hour (h, ap) {
  ap = ap.toLowerCase()
  h = parseInt(h, 10)
  return ap === 'pm' ? h < 12 ? (h + 12) : h : h === 12 ? 0 : h
}
