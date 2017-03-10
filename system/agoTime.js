let dateFormat = require('dateformat')

exports.normal = function(postTime) {
    let _d = new Date()
    let _now = _d.getTime()
    let _old = postTime*1000
    if (_now < _old+10*1000) {
        return '刚刚更新'
    } else if (_now < _old+60*1000) {
        return Math.floor((_now - _old)/1000) + '秒前'
    } else if (_now < _old+60*60*1000) {
        return Math.floor((_now - _old)/60/1000) + '分钟前'
    } else if (_old > (new Date(dateFormat(_d,'yyyy/mm/dd')+' 00:00:00')).getTime()) {
        _d.setTime(_old)
        return '今天 '+dateFormat(_d,'HH:MM')
    } else if (_old > (new Date(dateFormat(_d,'yyyy/mm/dd')+'/01/01 00:00:00')).getTime()) {
        _d.setTime(_old)
        return dateFormat(_d,'mm月dd日 HH:MM')
    } else {
        _d.setTime(_old)
        return dateFormat(_d,'yyyy/mm/dd HH:MM')
    }
}
