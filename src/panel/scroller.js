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
    this.rows = this.picker.dateTime.getRows()
    if (!this.main) {
      this._init()
    }
    this._renderHead()
    this.main.innerHTML = CONFIG[this.type](this.picker.dateTime, this.rows)
  },
  _renderHead: function () {
    var isYears = this.type === 'C'
    this.picker.head.innerHTML = (
      '<div class="picker-year' + (isYears ? ' picker-head-active' : '') + '"' + (isYears ? '' : ' data-click="toYears" data-active="active"') + '>' + this.picker.dateTime.parsedNow.year + '</div>' +
      '<div class="picker-date" data-click="toDays" data-active="active">' +
        utils.formatDate(
          this.picker.dateTime.now,
          this.picker.config.MDW.replace('D', '#')
        ).replace('#', this.picker.config.day[this.picker.dateTime.parsedNow.day]) +
      '</div>'
    )
  },
  afterRender: function () {
    var activeEle = this.main.querySelector('.picker-active')
    if (!activeEle) {
      return
    }
    this.itemHeight = activeEle.offsetHeight
    this.activeEle = activeEle
    var t = activeEle.offsetTop - (this.contentHeight - this.itemHeight) / 2
    this._slideTo(-t, 0)
  },
  _init: function () {
    this._initMain()
    this._initMidd()
  },
  _initMain: function () {
    this.main = utils.createElement('div', {
      className: 'scroller-picker-main'
    })
    this.mainStyle = this.main.style
    this.picker.content.appendChild(this.main)
    this.contentHeight = this.picker.content.offsetHeight
  },
  _initMidd: function () {
    this.midd = utils.createElement('div', {
      className: 'scroller-picker-midd'
    })
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
  selfChange: function () {
    if (this.__ani) {
      return
    }
    var that = this
    this._renderHead()
    this.activeEle.classList.remove('picker-active')
    var v = this.picker.dateTime.getLevelValue()
    var newActiveEle = this.main.querySelector('.picker-row[data-val="' + v + '"]')
    var realTo = (this.activeEle.dataset.val - v) * this.itemHeight + this.posY
    that._slideTo(realTo, 0, function () {
      newActiveEle.classList.add('picker-active')
      that.activeEle = newActiveEle
    })
  },
  _slideTo: function (v, transitionTime, cb) {
    var that = this
    var ended = function (e) {
      if (!that._slideEndFn) {
        return
      }
      window.clearTimeout(that._slideEndFn.tid)
      that._slideEndFn = null
      that.main.removeEventListener(utils.prefixNames.transitionEnd, ended, false)
      cb && cb.call(that, e)
      that.mainStyle.webkitTransition = 'none 0ms'
      that.mainStyle.transition = 'none 0ms'
    }
    this._slideEndFn && this._slideEndFn()
    this._slideEndFn = ended
    this.posY = v
    this.mainStyle[utils.prefixNames.transform] = 'translateY(' + this.posY + 'px) translateZ(0)'
    var timingFn = ' cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    if (transitionTime > 0) {
      this._slideEndFn.tid = window.setTimeout(function () {
        ended({})
      }, transitionTime + 20)
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
    var toV = base
    var startTime = e.timeStamp
    var startY = base
    this.__move = function (e) {
      var point = e.touches[0]
      var diffY = point.pageY - pointY
      toV = base + diffY

      var moveTime = e.timeStamp
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
      var realTo
      if (targetV < min) {
        count = levelVal - min
        targetV = min
        realTo = count * that.itemHeight + base
      } else if (targetV > max) {
        count = levelVal - max
        targetV = max
        realTo = count * that.itemHeight + base
      } else {
        realTo = count * that.itemHeight + base
      }
      return {
        realTo: realTo,
        targetV: targetV
      }
    }
    this.__end = function (e) {
      this.__move = null
      this.__end = null
      var endTime = e.timeStamp
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
          var c = getComputedPosition(that.main)
          var p = parsePos(c)
          that._slideTo(p.realTo, 0, function () {
            that.__ani = true
            that.picker.changeTo(p.targetV, true)
            that.__ani = false
          })
        }
      })
    }
  },
  destroy: function () {
    this._slideEndFn && this._slideEndFn()
    this.picker.content.removeChild(this.main)
    this.picker.content.removeChild(this.midd)
    utils.set2Null(['picker', 'main', 'mainStyle', 'midd', 'middStyle', 'activeEle', '__move', '__end'], this)
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
