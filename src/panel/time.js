var utils = require('../core/utils/index')

var CONFIG = {
  D: buildItem('hours', null, function (rows) {
    return rows.length / 2
  }),
  H: buildItem('minutes', function (v, i, setRotate) {
    return i % 5 === 0 ? ('<i style="' + setRotate(i, true) + '">' + utils.pad(v, 2) + '</i>') : '<b></b>'
  })
}
function TimePanel (picker) {
  this.picker = picker
  this.main = null
  this.mainStyle = null
  this.headActiveEle = null
  this.activeEle = null
  this.pickerLineEle = null
  this.type = picker.options.type
}

utils.extend(TimePanel.prototype, {
  render: function () {
    this.rows = this.picker.dateTime.getRows()
    if (!this.main) {
      this._init()
    }
    var isHours = this.type === 'D'
    this.picker.head.innerHTML = (
      '<div class="picker-hour' + (isHours ? ' picker-head-active' : '') + '"' + (isHours ? '' : ' data-click="toHours" data-active="active"') + '>' +
        utils.formatDate(this.picker.dateTime.now, 'HH') +
      '</div>:' +
      '<div class="picker-minute' + (!isHours ? ' picker-head-active' : '') + '"' + (!isHours ? '' : ' data-click="toMinutes" data-active="active"') + '>' +
        utils.formatDate(this.picker.dateTime.now, 'mm') +
      '</div>'
    )
    this.main.innerHTML = CONFIG[this.type](this.picker.dateTime, this.rows)
  },
  afterRender: function () {
    this.headHourEle = this.picker.head.querySelector('.picker-hour')
    this.headMinuteEle = this.picker.head.querySelector('.picker-minute')
    this.headActiveEle = this.picker.head.querySelector('.picker-head-active')
    this.activeEle = this.main.querySelector('.picker-active')
    this.pickerLineEle = this.main.querySelector('.time-picker-line')
  },
  _init: function () {
    this._initMain()
  },
  _initMain: function () {
    this.main = utils.createElement('div', {
      className: 'time-picker-main ' + (this.type === 'D' ? 'time-picker-main-hours' : 'time-picker-main-minutes')
    })
    this.mainStyle = this.main.style
    this.picker.content.appendChild(this.main)
  },
  show: function () {
    this.mainStyle.display = 'block'
  },
  hide: function () {
    this.mainStyle.display = 'none'
  },
  selfChange: function () {
    var h = utils.formatDate(this.picker.dateTime.now, 'HH')
    var m = utils.formatDate(this.picker.dateTime.now, 'mm')
    this.headHourEle.innerHTML = h
    this.headMinuteEle.innerHTML = m
    var v = this.picker.dateTime.getLevelValue()
    var newActiveEle = this.main.querySelector('.picker-cell[data-val="' + v + '"]')
    this.activeEle && this.activeEle.classList.remove('picker-active')
    newActiveEle.classList.add('picker-active')
    this.activeEle = newActiveEle
    var r = +newActiveEle.style[utils.prefixNames.transform].match(/rotate\((-?\d+)deg\)/)[1]
    r = r - 90
    this.pickerLineEle.style[utils.prefixNames.transform] = 'rotate(' + r + 'deg)'
    this.pickerLineEle.classList[newActiveEle.classList.contains('picker-cell-inner') ? 'add' : 'remove']('time-picker-line-inner')
  },
  _start: function (e) {
    var that = this
    var finalTarget = null
    var setToTarget = function (point) {
      var targetEle = document.elementFromPoint(point.pageX, point.pageY)
      if (targetEle && (targetEle.classList.contains('picker-cell') || (targetEle = targetEle.parentElement) && targetEle.classList.contains('picker-cell'))) {
        finalTarget = targetEle
        that.picker.changeTo(targetEle.getAttribute('data-val'), true)
      }
    }
    setToTarget(e.touches[0])
    this.__move = function (e) {
      setToTarget(e.touches[0])
    }
    this.__end = function (e) {
      this.__move = null
      this.__end = null
      finalTarget && that.picker.selV({
        realTarget: finalTarget
      })
    }
  },
  destroy: function () {
    this.picker.content.removeChild(this.main)
    utils.set2Null(['picker', 'main', 'mainStyle', 'headHourEle', 'headMinuteEle', 'headActiveEle', 'activeEle', 'pickerLineEle', '__move', '__end'], this)
  }
})

module.exports = TimePanel

function buildItem (type, parser, getLen) {
  if (!parser) {
    parser = function (v, i, setRotate) {
      return '<i style="' + setRotate(i, true) + '">' + v + '</i>'
    }
  }
  if (!getLen) {
    getLen = function (rows) {
      return rows.length
    }
  }
  return function (dateTime, rows) {
    var len = rows.length
    var rowsLen = getLen(rows)
    var isDouble = rowsLen !== len
    var perRotate = 360 / rowsLen

    var ulCls = ''
    var minuteStep = 1
    var isMinutes = type === 'minutes'
    if (isMinutes) {
      minuteStep = dateTime.options.minuteStep || 5
      ulCls += 'time-picker-minutes-' + minuteStep
    }
    var setRotate = function (index, reverse) {
      var r = perRotate * index
      var v = ''
      if (reverse) {
        r = -r
        v = 'translate(-50%, -50%) '
      }
      v += 'rotate(' + r + 'deg)'
      return '-webkit-transform:' + v + ';transform:' + v + ';'
    }
    var min = utils.date2Details(dateTime.options.min)
    var max = utils.date2Details(dateTime.options.max)
    var curr = dateTime.parsedNow[type]
    var activeStyle = ''
    var innerCls = ''
    var checkDisabled = function (v) {
      if (isMinutes) {
        var hours = dateTime.parsedNow.hours
        if (hours === min.hours) {
          return v < min.minutes
        } else if (hours === max.hours) {
          return v > max.minutes
        } else {
          return false
        }
      } else {
        // hours
        return v < min.hours || v > max.hours
      }
    }

    return (
      '<ul class="' + ulCls + '">' +
        rows.map(function (row, i) {
          var v = row[0]
          var klass = ''
          if (v === curr) {
            klass = ' picker-active'
            var r = 'rotate(' + (perRotate * i - 90) + 'deg)'
            activeStyle = '-webkit-transform:' + r + ';transform:' + r
            if (isDouble && (!v || v > 12)) {
              innerCls += ' time-picker-line-inner'
            }
          }
          if (minuteStep > 1 && i % minuteStep !== 0) {
            return ''
          }
          if (checkDisabled(v)) {
            klass += ' picker-disabled'
          }
          if (isDouble && (!v || v > 12)) {
            klass += ' picker-cell-inner'
          }
          return '<li class="picker-cell' + klass + '" data-click="selV" data-val="' + v + '" style="' + setRotate(i) + '">' + parser(v, i, setRotate) + '</li>'
        }).join('') +
      '</ul>' +
      '<div class="time-picker-line' + innerCls + '" style="' + activeStyle + '"></div>'
    )
  }
}
