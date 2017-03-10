const nodemailer = require('nodemailer');
let base = require('./base');
let logs = require('./logs');

/**
 * 邮件类
 */
class Mail {
    constructor() {
        this.set = {};
        this.init();
    }

    init() {
        this.set = Object.assign({},this.set,{
            'host': 'smtp.qq.com', //此处演示的是qq，如果配置有疑问，可以查询nodemailer相关文档
            'port': 465,
            'secure': true,
            'auth': {
                user: 'demo@qq.com',
                pass: 'password'
            }
        })
        this.transporter = nodemailer.createTransport(this.set);
    }

    send(to,title,content,cb) {
        this.transporter.sendMail({
            from: '"阳光网站状态监控台" <demo@qq.com>', // 记得改一下这里哦
            to: to,
            subject: title,
            text: content,
            html: content
        },function(err,info) {
            if (err && base.set.dev) console.log(err);
            if (cb) cb(info);
            logs.text('mail.send.logs',`发送一封邮件至${to},标题为[${title}]`);
        })
    }
}

module.exports = new Mail();
