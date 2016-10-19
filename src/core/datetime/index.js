var utils = require('../utils/index')
var events = require('../events')

var config = {
  // century = many years
  C: {
    value: 'year',
    rows: function (dateTime) {
      var rows = []
      var minYear = 1900
      var maxYear = 2100
      var start = minYear
      while (start <= maxYear) {
        rows.push([start++])
      }
      return rows
    },
    input: 'setFullYear'
  },
  // year = many months
  Y: {
    value: 'month',
    rows: function (dateTime) {
      var rows = []
      var minMonth = 0
      var maxMonth = 11
      var start = minMonth
      while (start <= maxMonth) {
        rows.push([start++])
      }
      return rows
    },
    input: 'setMonth'
  },
  // month = many days
  M: {
    value: 'date',
    rows: function (dateTime) {
      var rows = []
      var now = dateTime.now
      var days = utils.getDaysInMonthOfDate(now)
      var start = 0
      var i = 1
      var firstDay = utils.getFirstDayOfMonth(dateTime.now)
      var row = null
      while (i <= days) {
        if (start % 7 === 0) {
          row = []
          rows.push(row)
        }
        row.push(start < firstDay ? 0 : i++)
        start++
      }
      return rows
    },
    input: 'setDate'
  },
  // week = one week (7 days)
  W: {
    value: 'date',
    rows: function (dateTime) {
      var rows = []
      var parsedNow = dateTime.parsedNow
      var startDate = utils.getStartDateOfWeek(parsedNow.year, parsedNow.month, parsedNow.date)
      var start = 1
      var row = []
      while (start++ <= 7) {
        row.push(startDate.getDate())
        startDate = utils.nextDate(startDate)
      }
      rows.push(row)
      return rows
    },
    input: function (input, dateTime) {
      var now = dateTime.now
      var parsedNow = dateTime.parsedNow
      var date = utils.toDate(now)
      var nowDate = parsedNow.date
      if (Math.abs(input - nowDate) < 7) {
        date.setDate(input)
      } else if (input > nowDate) {
        // next month
        date.setDate(input)
        date = utils.nextMonth(date)
      } else {
        // prev month
        date.setDate(input)
        date = utils.prevMonth(date)
      }
      return date
    }
  },
  // day = many hours
  D: {
    value: 'hours',
    rows: function (dateTime) {
      var rows = []
      var minH = 0
      var maxH = 23
      var start = minH
      while (start <= maxH) {
        rows.push([start++])
      }
      return rows
    },
    input: 'setHours'
  },
  // hour = many minutes
  H: {
    value: 'minutes',
    rows: function (dateTime) {
      var rows = []
      var minM = 0
      var maxM = 59
      var start = minM
      while (start <= maxM) {
        rows.push([start++])
      }
      return rows
    },
    input: 'setMinutes'
  }
}

utils.each(config, function (conf) {
  var inputMethod = conf.input
  if (utils.isStr(inputMethod)) {
    conf.input = function (input, dateTime) {
      var now = dateTime.now
      var date = utils.toDate(now)
      date[inputMethod](input)
      return date
    }
  }
})

function DateTime (options) {
  this.options = utils.extend({
    default: new Date(),
    type: 'M' // Y M W D H
  }, options || {})
  var now = utils.toDate(this.options.default)
  if (!now) {
    now = new Date()
  }
  this.updateNow(now)
}

utils.extend(DateTime.prototype, {
  updateNow: function updateNow (date) {
    this.now = new Date(date.getTime())
    this.parsedNow = parseDate(this.now)
  },
  _getConf: function () {
    return config[this.options.type] || config['M']
  },
  getRows: function getRows () {
    var typeConfig = this._getConf()
    return typeConfig.rows(this)
  },
  getInputValue: function getInputValue (input) {
    var typeConfig = this._getConf()
    return typeConfig.input(input, this)
  },
  getLevelValue: function () {
    var typeConfig = this._getConf()
    return this.parsedNow[typeConfig.value]
  },
  destroy: function destroy () {
    this.now = null
    this.parsedNow = null
    this.options = null
  }
}, events)

module.exports = DateTime

function parseDate (date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    day: date.getDay(),
    hours: date.getHours(),
    minutes: date.getMinutes()
  }
}
