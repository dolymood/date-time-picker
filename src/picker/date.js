var Picker = require('./index')
var utils = require('../core/utils/index')
var DateTime = require('../core/datetime/index')
var DaysPanel = require('../panel/days')
var ScrollerPanel = require('../panel/scroller')

function DatePicker () {
  Picker.apply(this, arguments)
}

Picker.extend(DatePicker, {
  init: function () {
    if (this.needDefFormat) {
      this.options.format = 'yyyy-MM-dd'
    }
    utils.extend(this.options, {
      type: 'M'
    })
    this.panel = this.daysPanel = new DaysPanel(this)
  },
  _setDateTime: function () {
    var prevMonth = utils.prevMonth(this.dateTime.now)
    var nextMonth = utils.nextMonth(this.dateTime.now)
    this.prevDateTime = new DateTime(utils.extend({}, this.options, {
      default: prevMonth
    }))
    if (this.prevDateTime.parsedNow.month !== prevMonth.getMonth()) {
      this.prevDateTime.destroy()
      this.prevDateTime = null
    }
    this.nextDateTime = new DateTime(utils.extend({}, this.options, {
      default: nextMonth
    }))
    if (this.nextDateTime.parsedNow.month !== nextMonth.getMonth()) {
      this.nextDateTime.destroy()
      this.nextDateTime = null
    }
  },
  initEle: function () {
    this.ele.classList.add('date-picker-container')
  },
  shouldSet: function (val) {
    return !!val
  },
  setNowToPrev: function () {
    this.prevDateTime && this.setNow(this.prevDateTime.now)
  },
  setNowToNext: function () {
    this.nextDateTime && this.setNow(this.nextDateTime.now)
  },
  _to: function (type, name) {
    utils.extend(this.options, {
      type: type
    })
    this.panel.hide()
    if (!this[name]) {
      this[name] = new ScrollerPanel(this)
    } else {
      this[name].show()
    }
    this.panel = this[name]
    this.setDateTime()
  },
  toYears: function () {
    this._to('C', 'yearsPanel')
  },
  toMonths: function () {
    this._to('Y', 'monthsPanel')
  },
  toDays: function () {
    this._to('M', 'daysPanel')
  }
})

module.exports = DatePicker
