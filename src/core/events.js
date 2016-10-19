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
    return this
  },

  once: function once (name, func) {
    var that = this
    var fuc = function () {
      func.apply(this, arguments)
      that.off(name, fuc)
    }
    this.on(name, fuc)
    return this
  },

  off: function off (name, func) {
    if (!this._eventData) {
      this._eventData = {}
    }
    if (!this._eventData[name] || !this._eventData[name].length) {
      return this
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
    return this
  },

  trigger: function trigger (name) {
    if (!this._eventData) {
      this._eventData = {}
    }
    if (!this._eventData[name]) {
      return this
    }
    var args = this._eventData[name].slice.call(arguments, 1)
    utils.each(this._eventData[name], function (fuc) {
      fuc.apply(null, args)
    })
    return this
  }
}

module.exports = Events
