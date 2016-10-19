var utils = require('../core/utils/index')
var events = require('../core/events')
var DateTime = require('../core/datetime/index')
var DEFCONFIG = require('./config')

function Picker (options, config) {
  this.container = document.body
  if (!options) {
    options = {}
  }

  this.lang = options.lang || 'EN'
  this.lang = options.lang
  var defConfig = DEFCONFIG[this.lang]
  if (!defConfig) {
    defConfig = DEFCONFIG['EN']
  }
  this.config = utils.extend(defConfig, config || {})

  this.formatValue = null

  this.options = options
  this.needDefFormat = !this.options.format
  this.init()
  if (this.options.format && utils.isStr(this.options.default)) {
    this.options.default = utils.parseDate(this.options.default, this.options.format)
  }
  this._init()
}

Picker.extend = function (ChildFn, proto) {
  var F = function () {}
  F.prototype = Picker.prototype
  ChildFn.prototype = new F()
  ChildFn.prototype.super = Picker.prototype
  ChildFn.prototype.constructor = ChildFn
  utils.extend(ChildFn.prototype, proto || {})
  return ChildFn
}

utils.extend(Picker.prototype, {
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
  selfChange: utils.noop,
  setNow: function (now) {
    this.options.default = now
    this.setDateTime()
  },
  afterRender: utils.noop,
  _setDateTime: utils.noop,
  init: utils.noop,
  _init: function () {
    this._initEle()
    this.bindEvts()
    this.setDateTime()
  },
  _initEle: function () {
    var el = document.createElement('div')
    el.className = 'picker-container'
    this.ele = el
    this._initHead()
    this._initContent()
    this._initFoot()
    this.initEle()
    this._handleAni()
    this.container.appendChild(el)
  },
  initEle: utils.noop,
  render: function () {
    this.panel && this.panel.render()
  },
  _initHead: function () {
    this.head = document.createElement('div')
    this.head.className = 'picker-head'
    this.ele.appendChild(this.head)
  },
  _initContent: function () {
    this.content = document.createElement('div')
    this.content.className = 'picker-content'
    this.content.setAttribute('data-touchstart', '_start')
    this.ele.appendChild(this.content)
  },
  _initFoot: function () {
    this.foot = document.createElement('div')
    this.foot.className = 'picker-foot'
    this.foot.innerHTML = (
      '<a href="javascript:;" class="picker-act picker-act-0" data-click="cancel">' + this.config.CANCEL + '</a>' +
      '<a href="javascript:;" class="picker-act picker-act-1" data-click="ok">' + this.config.OK + '</a>'
    )
    this.ele.appendChild(this.foot)
  },

  _handleAni: function () {
    var ele = this.ele
    var ended = function () {
      ele.classList.remove('time-picker-ani')
      ele.removeEventListener(utils.prefixNames.aniEnd, ended, false)
    }
    ele.classList.add('time-picker-ani')
    ele.addEventListener(utils.prefixNames.aniEnd, ended, false)
  },

  _addEvt: function (ele, name, bubble) {
    if (!ele || !name) {
      return
    }
    if (bubble === undefined) {
      bubble = false
    }
    ele.addEventListener(name, this, bubble)
  },
  _removeEvt: function (ele, name, bubble) {
    if (!ele || !name) {
      return
    }
    if (bubble === undefined) {
      bubble = false
    }
    ele.removeEventListener(name, this, bubble)
  },

  desEvts: function () {
    this._removeEvt(this.ele, 'click')
    this._removeEvt(this.ele, 'touchstart')
  },
  bindEvts: function () {
    this._addEvt(this.ele, 'click')
    this._addEvt(this.ele, 'touchstart')
  },

  changeTo: function (v, noRender) {
    this.options.default = this.dateTime.getInputValue(v)
    this.setDateTime(noRender)
  },
  selV: function (e) {
    var target = e.realTarget
    var v = target.getAttribute('data-val') - 0
    if (this.shouldSet(v)) {
      this.changeTo(v)
    }
  },
  shouldSet: function (val) {
    return true
  },
  cancel: function () {
    this.trigger('canceled')
    this.hide()
    this.destroy()
  },
  ok: function () {
    var formatValue = this.dateTime.now
    var format = this.options.format
    if (format) {
      formatValue = utils.formatDate(formatValue, format)
    }
    this.trigger('selected', formatValue, this.dateTime.now)
    this.hide()
    this.destroy()
  },
  handleEvent: function (e) {
    var typeAttr = 'data-' + e.type
    var target = e.target
    var action = ''
    while ((target && target !== this.ele) && !(action = target.getAttribute(typeAttr))) {
      target = target.parentNode
    }
    if (!action) {
      return
    }
    e.realTarget = target
    if (this.panel && this.panel[action]) {
      this.panel[action](e)
    } else if (this[action]) {
      this[action](e)
    }
  },
  show: function () {
    this.ele && (this.ele.style.display = 'block')
  },
  hide: function () {
    this.ele && (this.ele.style.display = 'none')
  },
  destroy: function () {
    this.trigger('destroy')
    this.hide()
    this.desEvts()
    this.container.removeChild(this.ele)
    this.dateTime.destroy()
    this.panel && this.panel.destroy()
    this.container = null
    this.ele = null
    this.head = null
    this.content = null
    this.foot = null
    this.dateTime = null
    this.panel = null
    this.config = null
    this.formatValue = null
    this.lang = null
  }
}, events)

module.exports = Picker
