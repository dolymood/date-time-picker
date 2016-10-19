var utils = require('../core/utils/index')

var CONFIG = {
  C: buildItem('year'),
  Y: buildItem('month', function (m) {
    return m + 1
  })
}
function ScrollerPanel (picker) {
  this.picker = picker
  this.main = null
  this.mainStyle = null
  this.posY = 0
  this.type = picker.options.type
}

utils.extend(ScrollerPanel.prototype, {
  render: function () {
    if (!this.main) {
      this._init()
    }
    var isYears = this.type === 'C'
    this.picker.head.innerHTML = (
      '<div class="picker-year' + (isYears ? ' picker-head-active' : '') + '"' + (isYears ? '' : ' data-click="toYears"') + '>' + this.picker.dateTime.parsedNow.year + '</div>' +
      '<div class="picker-date" data-click="toDays">' +
        utils.formatDate(
          this.picker.dateTime.now,
          this.picker.config.MDW.replace('D', '#')
        ).replace('#', this.picker.config.day[this.picker.dateTime.parsedNow.day]) +
      '</div>'
    )
    this.main.innerHTML = CONFIG[this.type](this.picker.dateTime, this.rows)
    this._afterRender()
  },
  _afterRender: function () {
    var activeEle = this.main.querySelector('.picker-active')
    this.itemHeight = activeEle.offsetHeight
    var t = activeEle.offsetTop - (this.contentHeight - this.itemHeight) / 2
    // this.maxY = -(this.main.querySelector('.picker-row').offsetTop - (this.contentHeight - this.itemHeight) / 2)
    // this.minY = -(this.main.querySelector('.picker-row:last-child').offsetTop - (this.contentHeight - this.itemHeight) / 2)
    this._slideTo(-t, 0)
  },
  _init: function () {
    this.rows = this.picker.dateTime.getRows()
    this._initMain()
    this._initMidd()
  },
  _initMain: function () {
    this.main = document.createElement('div')
    this.main.className = 'scroller-picker-main'
    this.mainStyle = this.main.style
    this.picker.content.appendChild(this.main)
    this.contentHeight = this.picker.content.offsetHeight
  },
  _initMidd: function () {
    this.midd = document.createElement('div')
    this.midd.className = 'scroller-picker-midd'
    this.middStyle = this.midd.style
    this.picker.content.appendChild(this.midd)
  },
  show: function () {
    this.mainStyle.display = 'block'
    this.middStyle.display = 'block'
  },
  hide: function () {
    this.mainStyle.display = 'none'
    this.middStyle.display = 'none'
  },

  _slideTo: function (v, transitionTime, cb) {
    var that = this
    var tid = null
    var ended = function (e) {
      window.clearTimeout(tid)
      if (!that._slideEndFn) {
        return
      }
      that._slideEndFn = null
      that.main.removeEventListener(utils.prefixNames.transitionEnd, ended, false)
      that.mainStyle.webkitTransition = 'none 0ms'
      that.mainStyle.transition = 'none 0ms'
      cb && cb.call(that, e)
    }
    this._slideEndFn = ended
    this.posY = v
    this.mainStyle[utils.prefixNames.transform] = 'translateY(' + this.posY + 'px) translateZ(0)'
    var timingFn = ' cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    if (transitionTime > 0) {
      tid = window.setTimeout(function () {
        ended({})
      }, transitionTime)
      transitionTime += 'ms'
      this.mainStyle.webkitTransition = transitionTime + timingFn
      this.mainStyle.transition = transitionTime + timingFn
      this.main.addEventListener(utils.prefixNames.transitionEnd, ended, false)
    } else {
      ended()
    }
  },
  _start: function (e) {
    this._slideEndFn && this._slideEndFn()
    var point = e.touches[0]
    var pointY = point.pageY
    var that = this
    var base = this.posY
    var toV = 0
    var startTime = new Date().getTime()
    var startY = base
    var touchmove = function (e) {
      e.preventDefault()
      e.stopPropagation()
      var point = e.touches[0]
      var diffY = point.pageY - pointY
      toV = base + diffY

      var moveTime = new Date().getTime()
      if (moveTime - startTime > 300) {
        startTime = moveTime
        startY = toV
      }
      that.mainStyle[utils.prefixNames.transform] = 'translateY(' + toV + 'px) translateZ(0)'
    }
    var parsePos = function (pos) {
      var diff = pos - base
      var count = Math.round(diff / that.itemHeight)
      var levelVal = that.picker.dateTime.getLevelValue()
      var targetV = levelVal - count
      var min = that.rows[0][0]
      var max = that.rows[that.rows.length - 1][0]
      if (targetV < min) {
        count = levelVal - min
        targetV = min
      } else if (targetV > max) {
        count = levelVal - max
        targetV = max
      }
      var realTo = count * that.itemHeight + base
      return {
        realTo: realTo,
        targetV: targetV
      }
    }
    var touchend = function (e) {
      var endTime = new Date().getTime()
      var duration = endTime - startTime
      var time
      // 根据参数更新 toV 的值
      if (duration < 300) {
        var minY = -that.rows.length * that.itemHeight
        var maxY = that.contentHeight
        if (startY < minY) {
          startY = minY
        } else if (startY > maxY) {
          startY = maxY
        }
        var momentumRet = momentum(toV, startY, duration)
        toV = momentumRet.destination
        time = momentumRet.speed
      }
      var p = parsePos(toV)
      var realTo = p.realTo
      var targetV = p.targetV
      if (time === undefined) {
        time = 100 * Math.abs(realTo - toV) / that.itemHeight
        if (time > 50) {
          time = 20
        }
      } else {
        time = Math.abs(realTo - startY) / time
      }
      that._slideTo(realTo, time, function (e) {
        if (e || !time) {
          // 正常结束的
          that.picker.changeTo(targetV)
        } else {
          // 中途停止动画的
          var p = parsePos(getComputedPosition(that.main))
          that._slideTo(p.realTo, 0, function () {
            that.picker.changeTo(p.targetV, true)
          })
        }
      })
      document.removeEventListener('touchmove', touchmove, false)
      document.removeEventListener('touchend', touchend, false)
      document.removeEventListener('touchcancel', touchend, false)
    }
    document.addEventListener('touchmove', touchmove, false)
    document.addEventListener('touchend', touchend, false)
    document.addEventListener('touchcancel', touchend, false)
  },
  destroy: function () {
    this._slideEndFn && this._slideEndFn()
    this.picker.content.removeChild(this.main)
    this.picker.content.removeChild(this.midd)
    this.picker = null
    this.main = null
    this.mainStyle = null
    this.midd = null
    this.middStyle = null
  }
})

module.exports = ScrollerPanel

function buildItem (type, parser) {
  if (!parser) {
    parser = function (v) {
      return v
    }
  }
  return function (dateTime, rows) {
    var curr = dateTime.parsedNow[type]
    return (
      '<ul>' +
        rows.map(function (row) {
          var v = row[0]
          var klass = ''
          if (v === curr) {
            klass = ' picker-active'
          }
          return '<li class="picker-row' + klass + '" data-click="selV" data-val="' + v + '">' + parser(v) + '</li>'
        }).join('') +
      '</ul>'
    )
  }
}

function getComputedPosition (ele) {
  var matrix = window.getComputedStyle(ele, null)
  matrix = matrix[utils.prefixNames.transform].split(')')[0].split(', ')
  var y = +(matrix[13] || matrix[5])

  return y
}

function momentum (current, start, time) {
  var deceleration = 0.0006
  var distance = current - start
  var speed = Math.abs(distance) / time

  var destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1)

  return {
    destination: destination,
    speed: speed
  }
}
