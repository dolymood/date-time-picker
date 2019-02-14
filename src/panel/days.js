var utils = require('../core/utils/index')

function DaysPanel (picker) {
  this.picker = picker
  this.main = null
  this.mainStyle = null
  this.arrow = null
  this.arrowStyle = null
}

utils.extend(DaysPanel.prototype, {
  render: function () {
    if (!this.main) {
      this._init()
    }
    this._renderHead()
    this.main.innerHTML = buildCalendar(this.picker.prevDateTime, this.picker.config, 'prev') + buildCalendar(this.picker.dateTime, this.picker.config, 'curr') + buildCalendar(this.picker.nextDateTime, this.picker.config, 'next')
  },
  _renderHead: function () {
    this.picker.head.innerHTML = (
      '<div class="picker-year" data-click="toYears" data-active="active">' + this.picker.dateTime.parsedNow.year + '</div>' +
      '<div class="picker-date picker-head-active" data-click="toMonths" data-active="active">' +
        utils.formatDate(
          this.picker.dateTime.now,
          this.picker.config.MDW.replace('D', '#')
        ).replace('#', this.picker.config.day[this.picker.dateTime.parsedNow.day]) +
      '</div>'
    )
  },
  afterRender: function () {
    this.activeDateEle = this.main.querySelector('.picker-bdy-curr .picker-active')
  },
  selfChange: function () {
    this._renderHead()
    this.activeDateEle && this.activeDateEle.classList.remove('picker-active')
    var v = this.picker.dateTime.getLevelValue()
    var newActiveEle = this.main.querySelector('.picker-bdy-curr i[data-val="' + v + '"]')
    newActiveEle.classList.add('picker-active')
    this.activeDateEle = newActiveEle
  },
  _init: function () {
    this._initMain()
    this._initArrow()
  },

  _initMain: function () {
    this.main = utils.createElement('div', {
      className: 'date-picker-main'
    })
    this.mainStyle = this.main.style
    this.picker.content.appendChild(this.main)
    this.mainWidth = this.main.offsetWidth
  },
  _initArrow: function () {
    this.arrow = utils.createElement('div', {
      className: 'picker-actions-arrow'
    })
    this.arrow.innerHTML = '<i data-click="prevMonth" data-active="active">←</i><i data-click="nextMonth" data-active="active">→</i>'
    this.arrowStyle = this.arrow.style
    this.picker.content.appendChild(this.arrow)
  },

  show: function () {
    this.mainStyle.display = 'block'
    this.arrowStyle.display = 'block'
  },
  hide: function () {
    this.mainStyle.display = 'none'
    this.arrowStyle.display = 'none'
  },

  _slideTo: function (v, base, cb) {
    var that = this
    var TIME = 300 / 100
    var transitionTime = TIME * Math.abs(v - base)
    var ended = function () {
      if (!that._slideEndFn) {
        return
      }
      window.clearTimeout(that._slideEndFn.tid)
      that._slideEndFn = null
      that.main.removeEventListener(utils.prefixNames.transitionEnd, ended, false)
      that.mainStyle.webkitTransition = 'none 0ms'
      that.mainStyle.transition = 'none 0ms'
      that.mainStyle[utils.prefixNames.transform] = 'translateX(-100%) translateZ(0)'
      cb && cb.call(that)
    }
    this._slideEndFn && this._slideEndFn()
    this._slideEndFn = ended
    this.mainStyle[utils.prefixNames.transform] = 'translateX(' + v + '%) translateZ(0)'
    if (transitionTime > 0) {
      this._slideEndFn.tid = window.setTimeout(ended, transitionTime)
      transitionTime += 'ms'
      this.mainStyle.webkitTransition = transitionTime
      this.mainStyle.transition = transitionTime
    } else {
      ended()
    }
    this.main.addEventListener(utils.prefixNames.transitionEnd, ended, false)
  },
  _befChange: function (base) {
    if (!utils.isNum(base)) {
      base = -100
    }
    this._slideEndFn && this._slideEndFn()
    return base
  },
  prevMonth: function (base) {
    base = this._befChange(base)
    this._slideTo(0, base, function () {
      this.picker.setNowToPrev()
    })
  },
  nextMonth: function (base) {
    base = this._befChange(base)
    this._slideTo(-200, base, function () {
      this.picker.setNowToNext()
    })
  },
  _start: function (e) {
    var point = e.touches[0]
    var pointX = point.pageX
    var that = this
    var base = -100
    var toV = base
    var shouldChange = false
    this.__move = function (e) {
      var point = e.touches[0]
      var diffX = point.pageX - pointX
      diffX = diffX * 100 / that.mainWidth
      var absX = Math.abs(diffX)
      if (absX > 100) {
        diffX = diffX > 0 ? 100 : -100
      }
      shouldChange = absX > 55
      toV = base + diffX
      that.arrowStyle.opacity = (100 - absX * 0.9) / 100
      that.mainStyle[utils.prefixNames.transform] = 'translateX(' + toV + '%) translateZ(0)'
    }
    this.__end = function (e) {
      this.__move = null
      this.__end = null
      that.arrowStyle.opacity = 1
      if (shouldChange) {
        that[toV > base ? 'prevMonth' : 'nextMonth'](toV)
      } else {
        that._slideTo(base, toV)
      }
    }
    this._slideEndFn && this._slideEndFn()
  },
  destroy: function () {
    this._slideEndFn && this._slideEndFn()
    this.picker.content.removeChild(this.main)
    this.picker.content.removeChild(this.arrow)
    utils.set2Null(['picker', 'main', 'mainStyle', 'arrow', 'arrowStyle', 'activeDateEle', '__move', '__end'], this)
  }
})

module.exports = DaysPanel

function buildCalendar (datetime, config, cls) {
  if (!datetime) {
    return ''
  }
  var now = new Date()
  var parsedNow = {
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate()
  }
  var parsedCurrent = datetime.parsedNow
  var parsedMin = utils.date2Details(datetime.options.min)
  var parsedMax = utils.date2Details(datetime.options.max)
  var yearMonthOK = checkInrange(parsedCurrent, parsedMin, parsedMax)
  cls = ' picker-bdy-' + cls
  return (
    '<div class="picker-bdy' + cls + '">' +
      '<div class="date-picker-title">' + utils.formatDate(datetime.now, config.YM) + '</div>' +
      '<div class="date-picker-days">' +
        '<div class="date-picker-days-title">' +
          config.shortDay.map(function (d) {
            return '<i>' + d + '</i>'
          }).join('') +
        '</div>' +
        '<div class="date-picker-days-bdy">' +
          datetime.getRows().map(function (row) {
            return (
              '<div class="picker-row">' +
                row.map(function (d) {
                  var klass = parsedCurrent.year === parsedNow.year && parsedCurrent.month === parsedNow.month && d === parsedNow.date ? 'picker-now' : ''
                  if (d === parsedCurrent.date) {
                    klass = klass ? (klass + ' picker-active') : 'picker-active'
                  }
                  if (!yearMonthOK || checkDisabled(d, parsedCurrent, parsedMin, parsedMax)) {
                    klass = klass ? (klass + ' picker-disabled') : 'picker-disabled'
                  }
                  if (klass) {
                    klass = ' class="' + klass + '"'
                  }
                  var attr = ' data-val="' + d + '" '
                  if (d) {
                    attr += 'data-active="active" data-click="selV" data-val="' + d + '"'
                  }
                  return '<i' + attr + klass + '><span>' + d + '</span></i>'
                }).join('') +
              '</div>'
            )
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>'
  )
}

function checkInrange (parsedCurrent, parsedMin, parsedMax) {
  var ok = false
  if (parsedCurrent.year > parsedMin.year) {
    ok = true
  } else if (parsedCurrent.year === parsedMin.year) {
    ok = parsedCurrent.month >= parsedMin.month
  }
  if (ok) {
    if (parsedCurrent.year < parsedMax.year) {
      ok = true
    } else if (parsedCurrent.year === parsedMax.year) {
      ok = parsedCurrent.month <= parsedMax.month
    }
  }
  return ok
}

function checkDisabled (date, parsedCurrent, parsedMin, parsedMax) {
  var disabled = false
  if (parsedCurrent.year === parsedMin.year && parsedCurrent.month === parsedMin.month) {
    disabled = date < parsedMin.date
  }
  if (!disabled && parsedCurrent.year === parsedMax.year && parsedCurrent.month === parsedMax.month) {
    disabled = date > parsedMax.date
  }
  return disabled
}
