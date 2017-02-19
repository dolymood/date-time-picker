# date-time-picker

No Dependencies Lightweight Material Date/Time Picker For Mobile Web

`date-time-picker.min.js`: ~9k when gzipped
`date-time-picker.min.css`: ~2k when gzipped

![Select date and time](http://demo.aijc.net/js/date-time-picker/assets/date-time-picker.gif) ![QR](http://demo.aijc.net/js/date-time-picker/assets/qr2.png)

## Installation

Download from [https://github.com/dolymood/date-time-picker/tree/master/dist](https://github.com/dolymood/date-time-picker/tree/master/dist), it contains minified `js` and `css` files.

Or use npm:

```
npm install date-time-picker
```


## Usage

As a npm package:

```js
var DateTimePicker = require('date-time-picker')
```

AMD:

```js
var DateTimePicker = require('/path/to/date-time-picker.min.js')
```

Script load:

```js
var DateTimePicker = window.DateTimePicker
```

### DatePicker

```js
btn.onclick = function () {
  var datePicker = new DateTimePicker.Date(options, config)
  datePicker.on('selected', function (formatDate, now) {
    // formatData = 2016-10-19
    // now = Date instance -> Wed Oct 19 2016 20:28:12 GMT+0800 (CST)
  })
}
```

### TimePicker

```js
btn.onclick = function () {
  var timePicker = new DateTimePicker.Time(options, config)
  timePicker.on('selected', function (formatTime, now) {
    // formatTime = 18:30
    // now = Date instance -> Wed Oct 19 2016 18:30:13 GMT+0800 (CST)
  })
}
```

### API and Events

API:

```js
picker.show()
picker.hide()
picker.destroy()
```

Events:

```js
picker
  // click OK button
  .on('selected', function (formatValue, now) {
    console.log(formatValue, now)
  })
  // click CANCEL button
  // also trigger `destroy` event
  .on('canceled', function () {
    console.log('canceled')
  })
  .on('destroy', function () {
    console.log('destroy')
  })
```


## Options and Config

### DatePicker Options

```js
{
  lang: 'EN', // default 'EN'. One of 'EN', 'zh-CN'
  format: 'yyyy-MM-dd', // default 'yyyy-MM-dd'
  default: '2016-10-19', // default `new Date()`. If `default` type is string, then it will be parsed to `Date` instance by `format` . Or it can be a `Date` instance
}
```

### TimePicker Options

```js
{
  lang: 'EN', // default 'EN'
  format: 'HH:mm', // default 'HH:mm'
  default: '12:27', // default `new Date()`. If `default` type is string, then it will be parsed to `Date` instance by `format` . Or it can be a `Date` instance
  minuteStep: 5 // default 5. Select minutes step, must be one of [1, 5, 10]
}
```

### Config

Default English(EN):

```js
{
  day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  shortDay: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  MDW: 'D, MM-d',
  YM: 'yyyy-M',
  OK: 'OK',
  CANCEL: 'CANCEL'
}
```

Default 中文(zh-CN):

```js
{
  day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  shortDay: ['日', '一', '二', '三', '四', '五', '六'],
  MDW: 'M月d日D',
  YM: 'yyyy年M月',
  OK: '确定',
  CANCEL: '取消'
}
```


## License

MIT
