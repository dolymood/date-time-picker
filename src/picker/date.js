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
    this.prevDateTime = new DateTime(utils.extend({}, this.options, {
      default: utils.prevMonth(this.dateTime.now)
    }))
    this.nextDateTime = new DateTime(utils.extend({}, this.options, {
      default: utils.nextMonth(this.dateTime.now)
    }))
  },
  initEle: function () {
    this.ele.classList.add('date-picker-container')
  },
  shouldSet: function (val) {
    return !!val
  },
  setNowToPrev: function () {
    this.setNow(this.prevDateTime.now)
  },
  setNowToNext: function () {
    this.setNow(this.nextDateTime.now)
  },
  selV: function (e) {
    var target = e.realTarget
    var v = target.getAttribute('data-val') - 0
    if (this.shouldSet(v)) {
      this.changeTo(v, true)
    }
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
