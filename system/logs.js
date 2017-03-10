const fs = require('fs');
const path = require('path');
const url = require('url');
const dateFormat = require('dateformat');
let base = require('./base');

/**
 * 日志记录工具
 * 日志记录在 项目/logs/保存类型/ 中
 * add()方法是监听专用的
 * text()方法是记录文本信息的
 */
class Logs {
    constructor() {
        this.data = {};
        this.status = {};
        this.list = {};
    }

    add(reqUrl,info) {
        let hostname = url.parse(reqUrl).hostname;
        if (!this.list[hostname]) this.list[hostname] = [];
        this.list[hostname].push(`访问：${info.name}[${reqUrl}] - 更新时间：${dateFormat((new Date()).setTime(info.update),'yyyy-mm-dd HH:MM:ss')} - 状态码：${info.code};`);
        this.write(hostname);
        return this;
    }

    text(savename,info) {
        if (!this.list[savename]) this.list[savename] = [];
        this.list[savename].push(info+' - 记录时间:'+dateFormat('yyyy-mm-dd HH:MM:ss')+';');
        this.write(savename);
        return this;
    }

    write(hostname) {
        let _this = this;
        if (this.status.writing) {
            this.data[hostname] = function(hostname) {
                _this.write(hostname);
            }
            return this;
        }
        this.status.writing = true;
        let content = JSON.stringify(this.list[hostname].join("\r\n"))+"\r\n";
        this.list[hostname] = [];
        let now = new Date();
        let date = dateFormat(now,"yyyy-mm-dd");
        let savepath = path.join(base.sys.projectPath,'./logs/'+hostname+'/log_'+date+'.txt');
        base.handlerPath(savepath);
        fs.writeFile(savepath,content,{flag: 'a'},function(err) {
            _this.status.writing = false;
            if (_this.status.write) {
                _this.data[hostname](hostname);
            }
            if (err) {
                if (base.set.dev) console.log(err);
            }
        })
    }
}

module.exports = new Logs();
