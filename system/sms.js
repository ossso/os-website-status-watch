const TopClient = require('../libs/alidayu/topClient').TopClient;
let base = require('./base');
let logs = require('./logs');

/**
 * 短信类
 * 基于阿里大于，个人开发者也可以申请
 */
class Sms {
    constructor() {
        this.set = {};
        this.init();
    }

    init() {
        this.set = {
            'appkey': '123456',
            'appsecret': 'key',
            // 'RSET_URL': 'http://gw.api.taobao.com/router/rest', // 正式环境
            'RSET_URL': 'http://gw.api.tbsandbox.com/router/rest', // 沙箱环境
            'signname': '阿里大于', // 大于的签名
            'sms_temp': {
                'tips': '模板id',
            }
        };
        this.client = new TopClient({
            'appkey': this.set.appkey,
            'appsecret': this.set.appsecret,
            'RSET_URL': this.set.RSET_URL
        });

        return this;
    }

    send(to,temp,params,cb) {
        this.client.execute('alibaba.aliqin.fc.sms.num.send',{
            'extend': 'oswsw',
            'sms_type': 'normal',
            'sms_free_sign_name': this.set.signname,
            'sms_param': (params)?params:{},
            'rec_num': (Array.isArray(to))?to.join(','):to,
            'sms_template_code': this.set.sms_temp[temp]
        },function(err,req) {
            if (err && base.set.dev) console.log(err);
            if (base.set.dev) console.log(req);
            if (cb) cb(req);
            logs.text('sms.send.logs',`发送一条短信至${to},发送模板${temp},参数${JSON.stringify(params)}`);
        });
        return this;
    }
}

module.exports = new Sms();
