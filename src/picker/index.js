var utils = require('../core/utils/index')
var events = require('../core/events')
var DateTime = require('../core/datetime/index')
var DEFCONFIG = require('./config')

var typeMap = {
  mousedown: 'touchstart',
  mousemove: 'touchmove',
  mouseup: 'touchend'
}
var supportTouch = 'ontouchstart' in window
var EVENT_START = supportTouch ? 'touchstart' : 'mousedown'
var EVENT_MOVE = supportTouch ? 'touchmove' : 'mousemove'
var EVENT_END = supportTouch ? 'touchend' : 'mouseup'
var EVENT_CANCEL = supportTouch ? 'touchcancel' : 'mouseup'

function Picker (options, config) {
  this.container = document.body
  if (!options) {
    options = {}
  }

  this.lang = options.lang || 'EN'
  this.lang = options.lang
  this.destroyed = false
  var defConfig = DEFCONFIG[this.lang]
  if (!defConfig) {
    defConfig = DEFCONFIG['EN']
  }
  this.config = utils.extend(defConfig, config || {})

  this.options = options
  this.needDefFormat = !this.options.format
  this.init()
  this._setOptions()
  this._init()
}

var pickerPro = Picker.prototype
Picker.extend = function (ChildFn, proto) {
  var F = function () {}
  F.prototype = pickerPro
  ChildFn.prototype = new F()
  ChildFn.prototype.super = pickerPro
  ChildFn.prototype.constructor = ChildFn
  utils.extend(ChildFn.prototype, proto || {})
  return ChildFn
}

utils.extend(pickerPro, {
  _setOptions: function () {
    var that = this
    var minMax = {
      min: new Date(1900, 0, 1, 0, 0, 0, 0),
      max: new Date(2100, 11, 31, 23, 59, 59, 999)
    }
    var keys = ['default', 'min', 'max']
    keys.forEach(function (key) {
      if (that.options.format && that.options[key] && utils.isStr(that.options[key])) {
        that.options[key] = utils.parseDate(that.options[key], that.options.format)
      } else if (minMax[key]) {
        that.options[key] = minMax[key]
      }
    })
  },
  setDateTime: function (noRender) {
    this.dateTime = new DateTime(this.options)
    this._setDateTime(noRender)
    if (noRender) {
      this.selfChange()
    } else {
      this.render()
      this.afterRender()
    }
  },
  setNow: function (now) {
    this.options.default = now
    this.setDateTime()
  },
  _setDateTime: utils.noop,
  init: utils.noop,
  _init: function () {
    this._initEle()
    this.bindEvts()
    this.setDateTime()
  },
  _initEle: function () {
    var picker = utils.createElement('div', {
      className: 'picker-mask'
    })
    var el = utils.createElement('div', {
      className: 'picker-container'
    })
    this.rootEle = picker
    this.ele = el
    this._initHead()
    this._initContent()
    this._initFoot()
    this.initEle()
    this._handleAni()
    picker.appendChild(el)
    this.container.appendChild(picker)
  },
  initEle: utils.noop,
  _initHead: function () {
    this.head = utils.createElement('div', {
      className: 'picker-head'
    })
    this.ele.appendChild(this.head)
  },
  _initContent: function () {
    this.content = utils.createElement('div', {
      className: 'picker-content'
    }, {
      'data-touchstart': '_start'
    })
    this.ele.appendChild(this.content)
  },
  _initFoot: function () {
    this.foot = utils.createElement('div', {
      className: 'picker-foot',
      innerHTML: (
        '<a href="javascript:;" class="picker-act picker-act-clear" data-active="active" data-click="clear">' + this.config.CLEAR + '</a>' +
        '<a href="javascript:;" class="picker-act picker-act-cancel" data-active="active" data-click="cancel">' + this.config.CANCEL + '</a>' +
        '<a href="javascript:;" class="picker-act picker-act-ok" data-active="active" data-click="ok">' + this.config.OK + '</a>'
      )
    })
    this.ele.appendChild(this.foot)
  },

  _handleAni: function () {
    var ele = this.rootEle
    var ended = function () {
      ele.classList.remove('time-picker-ani')
      ele.removeEventListener(utils.prefixNames.aniEnd, ended, false)
    }
    ele.classList.add('time-picker-ani')
    ele.addEventListener(utils.prefixNames.aniEnd, ended, false)
  },

  _addEvt: function (name) {
    this.rootEle.addEventListener(name, this, false)
  },
  _removeEvt: function (name) {
    this.rootEle.removeEventListener(name, this, false)
  },

  _stop: function (e) {
    e.preventDefault()
    e.stopPropagation()
  },
  bindEvts: function () {
    this._addEvt(EVENT_START)
    this._addEvt(EVENT_MOVE)
    this._addEvt(EVENT_END)
    this._addEvt(EVENT_CANCEL)
  },

  changeTo: function (v, noRender) {
    this.options.default = this.dateTime.getInputValue(v)
    this.setDateTime(noRender)
  },
  selV: function (e) {
    var target = e.realTarget
    var v = target.getAttribute('data-val') - 0
    if (!target.classList.contains('picker-disabled') && this.shouldSet(v)) {
      this._selV(v)
    }
  },
  _selV: function (v) {
    this.changeTo(v, true)
  },
  shouldSet: function (val) {
    return true
  },
  clear: function () {
    this.setNow()
    this.trigger('cleared')
    this.hide()
  },
  cancel: function () {
    this.trigger('canceled')
    this.hide()
  },
  ok: function () {
    var formatValue = this.dateTime.now
    var format = this.options.format
    if (format) {
      formatValue = utils.formatDate(formatValue, format)
    }
    this.trigger('selected', formatValue, this.dateTime.now)
    this.hide()
  },
  __activeStart: function (e) {
    this.__activeEnd()
    var targetAction = this._getTargetAction(e, 'active')
    if (!targetAction.action) {
      return
    }
    this.activeTA = targetAction
    targetAction.target.classList.add(targetAction.action)
  },
  __activeEnd: function () {
    this.activeTA && this.activeTA.target.classList.remove(this.activeTA.action)
    this.activeTA = null
  },
  __touchstart: function (e) {
    this.__activeStart(e)
    this.__start(e)
    var target = e.target
    var point = e.targetTouches[0]
    this.__s_x = point.pageX
    this.__s_y = point.pageY
    this.__startTime = e.timeStamp
    this.__target = target
  },
  __touchmove: function (e) {
    this.__move(e)
    if (!this.__target) {
      return
    }
    var point = e.changedTouches[0]
    var b = 10
    if (this.__target !== e.target || (Math.abs(point.pageX - this.__s_x) > b || Math.abs(point.pageY - this.__s_y) > b)) {
      this.__target = null
    }
  },
  __touchend: function (e) {
    this.__activeEnd(e)
    this.__end(e)
    // check click event
    if (!this.__target) {
      return
    }
    var t = e.timeStamp
    if ((t - this.__lastTime) < 200) {
      return
    }
    if ((t - this.__startTime) > 700) {
      return
    }
    var targetEle = this.__target
    this.__lastTime = t
    this.__target = null
    e.__target = targetEle
    e.__type = 'click'
  },
  __touchcancel: function (e) {
    this.__activeEnd(e)
    this.__end(e)
    this.__target = null
  },
  handleEvent: function (e) {
    this._stop(e)
    var type = e.type
    if (typeMap[type]) {
      type = typeMap[type]
      e.__type = type
      e.touches = e.changedTouches = e.targetTouches = [e]
    }
    this['__' + type](e)
    this._handleEvent(e)
  },
  _getTargetAction: function (e, type) {
    var target = e.__target || e.target
    var typeAttr = 'data-' + (type || e.__type || e.type)
    var action = ''
    while ((target && target !== this.rootEle) && !(action = target.getAttribute(typeAttr))) {
      target = target.parentNode
    }
    return {
      target: target,
      action: action
    }
  },
  _handleEvent: function (e) {
    var targetAction = this._getTargetAction(e)
    if (!targetAction.action) {
      return
    }
    e.realTarget = targetAction.target
    if (this.panel && this.panel[targetAction.action]) {
      this.panel[targetAction.action](e)
    } else if (this[targetAction.action]) {
      this[targetAction.action](e)
    }
  },
  show: function () {
    if (this.rootEle) {
      this.rootEle.style.display = 'block'
      this._handleAni()
    }
  },
  hide: function () {
    this.rootEle && (this.rootEle.style.display = 'none')
  },
  desEvts: function () {
    this._removeEvt(EVENT_START)
    this._removeEvt(EVENT_MOVE)
    this._removeEvt(EVENT_END)
    this._removeEvt(EVENT_CANCEL)
  },
  destroy: function () {
    if (this.destroyed) {
      return
    }
    this.trigger('destroy')
    this.hide()
    this.desEvts()
    this.container.removeChild(this.rootEle)
    this.dateTime.destroy()
    this.panel && this.panel.destroy()
    utils.set2Null(['container', 'rootEle', 'ele', 'head', 'content', 'foot', 'dateTime', 'panel', 'config', 'lang'], this)
    this.destroyed = true
  }
}, events)

var es = ['selfChange', 'render', 'afterRender', '__start', '__move', '__end']
es.forEach(function (name) {
  pickerPro[name] = function () {
    this.panel && this.panel[name] && this.panel[name].apply(this.panel, arguments)
  }
})

module.exports = Picker
