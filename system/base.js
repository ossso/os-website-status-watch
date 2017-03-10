const fs = require('fs');
const path = require('path');
let config = require('./config');

/**
 * Base
 */
class Base {
    constructor() {
        this.set = {};
        this.sys = {};
        this.tpl = {};
        this.init();
    }

    init() {
        this.set = Object.assign({},config.set);
        this.sys = Object.assign({},{
            projectPath: path.join(__dirname,'../')
        },config.site);

        this.tpl.path = '';
    }

    /**
     * 处理实际文件路径，生成对应的文件夹
     * @param  {string} dir
     */
    handlerPath(dir) {
        let judgePath = function(_path,cb) {
            let paths = path.parse(_path);
            if (!fs.existsSync(paths.dir)) {
                judgePath(paths.dir,function() {
                    fs.mkdirSync(paths.dir)
                });
            }
            if (typeof cb === 'function') {
                cb();
            }
        }
        judgePath(dir);
        return this;
    }


    /**
     * 获取用户IP
     */
    getClientIP(req) {
        let ip = req.ip;
        let ip_arr = ip.split(':');
        return ip_arr[ip_arr.length - 1];
    }

}

let base = new Base();

module.exports = base;
