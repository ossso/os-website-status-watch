const fs = require('fs');
const path = require('path');
const url = require('url');
const superagent = require('superagent');
const dateFormat = require('dateformat');
let base = require('./base');
let logs = require('./logs');
let hash = require('./hash');
let ago = require('./agoTime');
let mail = require('./mail');
let sms = require('./sms');

/**
 * 监听类
 * update 更新或者新增
 * delete 删除
 * get 获取
 * write 写入本地
 */
class Watch {
    constructor() {
        this.data = {};
        this.status = {};
        this.init().start();
    }

    init() {
        this.filepath = path.join(base.sys.projectPath,'./data/list.json');
        if (!fs.existsSync(this.filepath)) {
            this.list = {};
        } else {
            let listString = fs.readFileSync(this.filepath,'utf-8');
            this.list = (listString.length)?JSON.parse(listString):{};
        }

        this.failLogPath = path.join(base.sys.projectPath,'./data/fail.json');
        if (!fs.existsSync(this.failLogPath)) {
            this.fail = {};
        } else {
            let failString = fs.readFileSync(this.failLogPath,'utf-8');
            this.fail = (failString.length)?JSON.parse(failString):{};
        }

        return this;
    }

    update(key,info,cb) {
        let index = key;
        if (this.list[index] && this.list[index].update) {
            delete this.list[index].update;
        } else if (!key) {
            index = hash.md5(dateFormat('yyyymmddHHMMss')).substr(8,16);
        }
        this.merge(index,info);
        if (info.code) {
            this.handlerCode(index,info.code);
        }
        if (cb) {
            cb(index);
        }
        return this;
    }

    delete(index) {
        let item = this.list[index];
        let status = !!item;
        let faillog = false;
        if (status && this.fail[item.hostname]) {
            delete this.fail[item.hostname];
            faillog = true;
        }
        if (status) delete this.list[index];
        if (status) {
            this.write();
        }
        if (faillog) {
            this.writeFail();
        }
        return this;
    }

    write() {
        if (this.status.writing) {
            this.status.write = true;
            return this;
        }
        let _this = this;
        this.status.writing = true;
        let content = JSON.stringify(this.list);
        base.handlerPath(this.filepath);
        fs.writeFile(this.filepath,content,{flag: 'w',encoding: 'utf8'},function(err) {
            _this.status.writing = false;
            if (_this.status.write) {
                _this.write();
                _this.status.write = false;
            }
            if (err && base.set.dev) {
                console.log(err);
            }
        })
    }

    get(index) {
        if (index) {
            let item = this.list[index];
            let item2 = Object.assign({},item,{
                index: index,
                fail: this.fail[item.hostname]
            });
            this.format(item2);
            return item2;
        }
        let newlist = [];
        for (let i in this.list) {
            let item = this.list[i];
            let item2 = Object.assign({},item,{
                index: i
            });
            if (this.fail[item.hostname]) {
                item2 = Object.assign({},item2,{
                    fail: this.fail[item.hostname]
                });
            }
            this.format(item2);
            newlist.push(item2);
        }
        return newlist;
    }
}
let CL = Watch;
CL.fn = CL.prototype;

/**
 * 合并信息
 * @param  {number} index
 * @param  {object} info
 */
CL.fn.merge = function(index,info) {
    let d = new Date();
    if (info.url) {
        let urls = url.parse(info.url);
        info.hostname = urls.hostname;
    }
    if (info.tips) {
        let tipsname = info.tips.replace(/\s/g,'');
        function verify(str) { //验证手机&Email
            var flag = false;
            var reg1 = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+(\.[a-zA-Z]{2,9})+$/;
            var reg2 = /^(13|14|15|17|18)\d{9}/;
            var reg3 = /\D/g;
            flag = (reg1.test(str) || reg2.test(str));
            if (reg2.test(str) && reg3.test(str)) {
                flag = (str.length == 11);
            }
            return flag;
        }
        if (!verify(tipsname)) info.tips = false;
    }
    this.list[index] = Object.assign({},{
        "name": "",
        "url": "",
        "update": d.getTime(),
        "code": "200",
        "time": 60000,
        "tips": false,
        "hostname": info.hostname
    },this.list[index],info);
    return this;
};

/**
 * 启动监听
 */
CL.fn.start = function() {
    let _this = this;
    for (let i in this.list) {
        this.request(i);
    }
    return this;
};

/**
 * 请求
 * @param  {number} index
 */
CL.fn.request = function(index,status) {
    let _this = this;
    if (this.data['sett_'+index] && !status) clearTimeout(this.data['sett_'+index]);
    let item = this.list[index];
    if (!item.url) {
        if (base.set.dev) console.log(item);
    }
    superagent.get(item.url)
    .set("User-Agent",base.set.ua)
    .end(function(err,data) {
        if (err) {
            if (base.set.dev) {
                console.error(err)
            }
            _this.update(index,{
                "code": '-1'
            });
        } else {
            _this.update(index,{
                "code": data.statusCode
            });
        }
        _this.write();
        // 记录日志
        logs.add(item.url,{
            name: _this.list[index].name,
            update: _this.list[index].update,
            code: _this.list[index].code
        });
        // 判断是否自动加任务
        if (_this.list[index].time > 0 && !status) {
            _this.data['sett_'+index] = setTimeout(function() {
                _this.request(index);
            },_this.list[index].time);
        }
    });
    return this;
};

/**
 * 处理代码
 */
CL.fn.handlerCode = function(index,code) {
    let _this = this;
    let item = this.list[index];
    if (!this.fail[item.hostname]) this.fail[item.hostname] = {};
    if (code == '200') {
        this.fail[item.hostname].num = 0;
    } else {
        let str = '[code:'+code+']-[time:'+item.update+']'+"\r\n";
        this.fail[item.hostname] = Object.assign({},this.fail[item.hostname],{
            num: (this.fail[item.hostname].num)?this.fail[item.hostname].num+1:1,
            logs: (this.fail[item.hostname].logs)?this.fail[item.hostname].logs+str:str
        });
        if (this.fail[item.hostname].num < 4) {
            setTimeout(function() {
                _this.request(index,true);
            },this.fail[item.hostname].num*15*1000);
        }
    }
    if (this.fail[item.hostname].num > 2) {
        if (base.set.dev) console.log('警告['+item.name+' - '+item.url+']已掉线');
        this.sendTips(index);
    }
    this.writeFail();
    return this;
};

/**
 * 失败记录
 */
CL.fn.writeFail = function() {
    if (this.status.writing_fail) {
        this.status.write_fail = true;
        return this;
    }
    let _this = this;
    this.status.writing_fail = true;
    let content = JSON.stringify(this.fail);
    let savepath = path.join(base.sys.projectPath,'./data/fail.json');
    base.handlerPath(savepath);
    fs.writeFile(savepath,content,{flag: 'w',encoding: 'utf8'},function(err) {
        _this.status.writing_fail = false;
        if (_this.status.write_fail) {
            _this.writeFail();
            _this.status.write_fail = false;
        }
        if (err && base.set.dev) {
            console.log(err);
        }
    });
};

/**
 * 发送识别提醒
 * 目前支持邮件提醒
 */
CL.fn.sendTips = function(index) {
    if (!index) return this;
    let item = this.list[index];
    if (!item) return this;
    let tips_username = item.tips;
    if (!tips_username) return this;
    if (tips_username.indexOf('@') > -1) {
        let title = `网站[${item.name}]无法正常访问，${dateFormat("yyyy-mm-dd HH:MM")}`
        let content = `
        <p>Hello，亲！</p>
        <p>您关注的网站[${item.name}]无法正常访问，状态码[${item.code}]</p>
        <p>您手动点击[<a href="${item.url}" target="_blank">${item.url}</a>]进行测试</p>
        <p>下次检测时间：${dateFormat((new Date()).setTime(item.update+item.time),'yyyy-mm-dd HH:MM:ss')}</p>
        `
        mail.send(tips_username,title,content);
    } else {
        let reg = /^(13|14|15|17|18)\d{9}/;
        if (reg.test(tips_username) && tips_username.length == 11) {
            sms.send(tips_username,'tips',{
                site_name: item.name,
                site_code: item.code
            });
        } else {
            if (base.set.dev) console.log(tips_username,'手机号码验证失败');
        }
    }
    return this;
};


/**
 * 信息过滤
 */
CL.fn.format = function(item) {
    item.updateTime = ago.normal(Math.floor(item.update/1000));
    item.timeRule = (function(t) {
        let num = Math.floor(t/1000);
        if (num < 60) {
            return num+'秒';
        } else if (num < 60*60) {
            return num/60 + '分钟';
        } else if (num < 60*60*24) {
            return num/60/60 + '小时';
        } else {
            return num/60/60/24 + '天';
        }
    })(item.time);
    item.statusName = (function(code,num) {
        code = code.toString();
        let str = '';
        switch (code) {
            case '200':
                return '正常';
            case '-1':
                str += '无法访问';
            break;
            default:
                str += '访问异常,error:'+code;
        }
        if (num > 2) {
            str += ' [已确认掉线]';
        } else if (num) {
            str += ' [已失败'+num+'次]';
        }
        return str;
    })(item.code,item.number);
    item.refTime = (function(update,time) {
        let t = update + time;
        let _d = new Date();
        _d.setTime(t);
        return dateFormat(_d,'yyyy-mm-dd HH:MM:ss');
    })(item.update,item.time);
    return this;
};

module.exports = new Watch();
