var utils = require('./utils')

// 简单事件
var Events = {
  on: function on (name, func) {
    if (!this._eventData) {
      this._eventData = {}
    }
    if (!this._eventData[name]) {
      this._eventData[name] = []
    }
    var listened = false
    utils.each(this._eventData[name], function (fuc) {
      if (fuc === func) {
        listened = true
        return false
      }
    })
    if (!listened) {
      this._eventData[name].push(func)
    }
  },

  once: function once (name, func) {
    var that = this
    var fuc = function () {
      func.apply(this, arguments)
      that.off(name, fuc)
    }
    this.on(name, fuc)
  },

  off: function off (name, func) {
    if (!this._eventData) {
      this._eventData = {}
    }
    if (!this._eventData[name] || !this._eventData[name].length) {
      return
    }
    if (func) {
      utils.each(this._eventData[name], function (fuc, i) {
        if (fuc === func) {
          this._eventData[name].splice(i, 1)
          return false
        }
      })
    } else {
      this._eventData[name] = []
    }
  },

  trigger: function trigger (name) {
    if (!this._eventData) {
      this._eventData = {}
    }
    if (!this._eventData[name]) {
      return
    }
    var args = this._eventData[name].slice.call(arguments, 1)
    utils.each(this._eventData[name], function (fuc) {
      fuc.apply(null, args)
    })
  }
}

module.exports = Events
