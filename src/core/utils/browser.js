var prefixNames = {
  aniEnd: 'animationend',
  transform: 'transform'
}

var el = document.createElement('div')
var eleStyle = el.style
var verdors = ['a', 'webkitA', 'MozA', 'OA', 'msA']
var endEvents = ['animationend', 'webkitAnimationEnd', 'animationend', 'oAnimationEnd', 'MSAnimationEnd']
var transNames = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform']
var animation
var i = 0
var len = verdors.length
for (; i < len; i++) {
  animation = verdors[i] + 'nimation'
  if (animation in eleStyle) {
    prefixNames.aniEnd = endEvents[i]
    prefixNames.transform = transNames[i]
  }
}
prefixNames.transitionEnd = prefixNames.aniEnd.replace('AnimationEnd', 'TransitionEnd').replace('animationend', 'transitionend')

module.exports = {
  prefixNames: prefixNames
}
