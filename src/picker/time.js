var Picker = require('./index')
var utils = require('../core/utils/index')
var TimePanel = require('../panel/time')

function TimePicker () {
  Picker.apply(this, arguments)
}

Picker.extend(TimePicker, {
  init: function () {
    if (this.needDefFormat) {
      this.options.format = 'HH:mm'
    }
    var minuteStep = this.options.minuteStep
    if (!minuteStep) {
      minuteStep = 5
    }
    // only 1 5 10
    if (minuteStep !== 1 && minuteStep !== 5 && minuteStep !== 10) {
      minuteStep = 5
    }
    utils.extend(this.options, {
      type: 'D',
      minuteStep: minuteStep
    })
    this.panel = this.hoursPanel = new TimePanel(this)
  },
  initEle: function () {
    this.ele.classList.add('time-picker-container')
  },
  _selV: function (v) {
    var that = this
    this.super._selV.call(this, v)
    setTimeout(function () {
      that.toMinutes()
    })
  },
  _to: function (type, name) {
    if (this.options.type === type) {
      return
    }
    utils.extend(this.options, {
      type: type
    })
    this.panel.hide()
    if (!this[name]) {
      this[name] = new TimePanel(this)
    } else {
      this[name].show()
    }
    this.panel = this[name]
    this.setDateTime()
  },
  toHours: function () {
    this._to('D', 'hoursPanel')
  },
  toMinutes: function () {
    this._to('H', 'minutesPanel')
  }
})

module.exports = TimePicker
