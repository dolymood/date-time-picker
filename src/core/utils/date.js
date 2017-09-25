var dateUtils = require('../date')

function toDate (date) {
  if (date instanceof Date) {
    return new Date(date.getTime())
  }
  date = new Date(date)
  if (isNaN(date.getTime())) {
    return null
  }
  return date
}

var defFormat = 'yyyy-MM-dd'
function formatDate (date, format) {
  date = toDate(date)
  if (!date) {
    return ''
  }
  return dateUtils.format(date, format || defFormat)
}
function parseDate (strDate, format) {
  return dateUtils.parse(strDate, format || defFormat)
}

function getDaysInMonth (year, month) {
  var m30s = [3, 5, 8, 10]
  if (~m30s.indexOf(month)) {
    return 30
  }
  if (month === 1) {
    // 2
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
      return 29
    } else {
      return 28
    }
  }
  return 31
}
function getDaysInMonthOfDate (date) {
  if (date.getDaysInMonth) {
    return date.getDaysInMonth()
  }
  return getDaysInMonth(date.getFullYear(), date.getMonth())
}
function getFirstDayOfMonth (date) {
  date = new Date(date.getTime())
  date.setDate(1)
  return date.getDay()
}
var DAY_SECONDS = 24 * 60 * 60 * 1000
function getStartDateOfMonth (year, month) {
  var date = new Date(year, month, 1)
  var day = date.getDay()

  if (day === 0) {
    date.setTime(date.getTime() - DAY_SECONDS * 7)
  } else {
    date.setTime(date.getTime() - DAY_SECONDS * day)
  }
  return date
}
function getStartDateOfWeek (year, month, date) {
  date = new Date(year, month, date)
  var day = date.getDay()
  date.setTime(date.getTime() - DAY_SECONDS * day)
  return date
}
function getWeekNumber (date) {
  date = new Date(date.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  var firstWeek = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - firstWeek.getTime()) / DAY_SECONDS - 3 + (firstWeek.getDay() + 6) % 7) / 7)
}

function prevMonth (date) {
  date = new Date(date.getTime())
  var year = date.getFullYear()
  var month = date.getMonth()
  var dDate = date.getDate()

  var newYear = month === 0 ? year - 1 : year
  var newMonth = month === 0 ? 11 : month - 1

  var newMonthDayCount = getDaysInMonth(newYear, newMonth)
  if (newMonthDayCount < dDate) {
    date.setDate(newMonthDayCount)
  }

  date.setMonth(newMonth)
  date.setFullYear(newYear)

  return date
}
function nextMonth (date) {
  date = new Date(date.getTime())
  var year = date.getFullYear()
  var month = date.getMonth()
  var dDate = date.getDate()

  var newYear = month === 11 ? year + 1 : year
  var newMonth = month === 11 ? 0 : month + 1

  var newMonthDayCount = getDaysInMonth(newYear, newMonth)
  if (newMonthDayCount < dDate) {
    date.setDate(newMonthDayCount)
  }

  date.setMonth(newMonth)
  date.setFullYear(newYear)

  return date
}
function prevDate (date) {
  var time = date.getTime()
  date = new Date(time)
  date.setTime(time - DAY_SECONDS)
  return date
}
function nextDate (date) {
  var time = date.getTime()
  date = new Date(time)
  date.setTime(time + DAY_SECONDS)
  return date
}

function date2Details (date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    day: date.getDay(),
    hours: date.getHours(),
    minutes: date.getMinutes()
  }
}

module.exports = {
  toDate: toDate,

  date2Details: date2Details,

  formatDate: formatDate,
  parseDate: parseDate,

  getDaysInMonth: getDaysInMonth,
  getDaysInMonthOfDate: getDaysInMonthOfDate,
  getFirstDayOfMonth: getFirstDayOfMonth,
  getStartDateOfMonth: getStartDateOfMonth,
  getStartDateOfWeek: getStartDateOfWeek,
  getWeekNumber: getWeekNumber,

  prevMonth: prevMonth,
  nextMonth: nextMonth,
  prevDate: prevDate,
  nextDate: nextDate
}
