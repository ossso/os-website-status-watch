const fs = require('fs');
const path = require('path');
const url = require('url');
let base = require('./base');
let view = require('./view');
let watch = require('./watch');
let user = require('./user');

/**
 * 主引擎
 */
class OSCore {
    constructor() {
        this.status = {};
        this.data = {};

        this.class = {
            view: view,
            watch: watch
        }

        this.blacklist = [];

        let blacklistpath = path.join(base.sys.projectPath,'./data/blacklist');
        if (fs.existsSync(blacklistpath)) {
            let listString = fs.readFileSync(blacklistpath,'utf-8');
            listString = listString.replace(/[\r|\n]/g,'');
            listString = listString.substr(0,listString.length-1);
            this.blacklist = listString.split(',');
        }
    }

    /**
     * 挂载app和express
     * @param  {object} app
     * @param  {object} express
     */
    mount(app,express) {
        let _this = this;
        this.app = app;
        this.express = express;
        this.app.use('/static',this.express.static(path.join(base.sys.projectPath,'./public/static')));

        // 处理所有GET请求
        this.app.get('*',function(req,res,next) {
            _this.handlerGetRequest(req,res,next);
        });

        // 处理登录
        this.app.post('/sign/in',function(req,res) {
            if (_this.hasBlackList(req)) return;
            user.login(req,function(status,msg) {
                if (status) {
                    req.session.loginFailNumber = 0;
                    res.redirect(302,'../../');
                } else {
                    if (!req.session.loginFailNumber) req.session.loginFailNumber = 0;
                    req.session.loginFailNumber++;
                    if (req.session.loginFailNumber > 5) {
                        _this.addBlacklist(req);
                    }
                    res.redirect(302,'../../login?msg='+msg);
                }
            });
        });

        // 处理更新
        this.app.post('/update',function(req,res) {
            user.checkUserLogin(req)
            if (!user.status) {
                res.redirect(302,'./');
                return;
            }
            let _name = req.body.name;
            let _url = req.body.url;
            let _time = req.body.time;
            if (!(_name && _url && _time)) {
                res.redirect(302,'./');
                return;
            }
            _time = _time * 60 * 1000;
            let _index = req.body.index;
            let _tips = req.body.tips;
            let _key = (!!_index)?_index:false;
            watch.update(_key,{
                name: _name,
                url: _url,
                time: _time,
                tips: _tips
            },function(index) {
                watch.request(index);
                res.redirect(302,'./');
            });
        });

        // 处理删除
        this.app.post('/delete',function(req,res) {
            user.checkUserLogin(req)
            if (!user.status) {
                res.redirect(302,'./');
                return;
            }
            let _index = req.body.index;
            if (!_index) {
                res.redirect(302,'./');
                return;
            }
            watch.delete(_index);
            res.redirect(302,'./');
        });

        // 定义500
        this.app.use(function(err,req,res,next) {
            if (base.set.dev) {
                console.error(err.stack)
            }
            res.status(500)
                .sendFile(path.join(base.sys.projectPath,'/public/error/500.html'));
        })
        this.status.mount = true;
        this.listen();
        return this;
    }


    /**
     * 监听端口
     */
    listen() {
        if (!this.status.mount) {
            console.log('请先Monut()');
            return this;
        }
        // 监听端口
        this.app.listen(base.set.port);
        if (base.set.dev) {
            console.log('Watch Port:'+base.set.port);
        }
        return this;
    }

}

let CL = OSCore;
CL.fn = CL.prototype;
/**
 * 判断是否存在物理路径
 * @param {string} _path
 */
CL.fn.hasPath = function(_path) {
    if (!path.isAbsolute(_path)) return false
    let _dir = path.join(base.sys.projectPath,'public',_path);
    return fs.existsSync(_dir)
};


/**
 * 处理所有GET请求
 */
CL.fn.handlerGetRequest = function(req,res,next) {
    this.req = req;
    this.res = res;
    this.next = next;

    let _this = this;

    // 判断是否存在真实文件，存在就输出真实文件
    let _path = this.req.path;
    if (_path.lastIndexOf('/') == _path.length - 1) {
        _path += 'index.html';
    }
    let paths = this.data.paths = path.parse(_path);
    if (this.hasPath(_path)) {
        let filepath = path.join(base.sys.projectPath,'public',_path);
        this.output('file',filepath);
        return this;
    }
    switch (paths.dir+paths.name) {
        case '/':
        case '/index':
            this.data.type = 'index';
            this.output('index');
        break;
        case '/login':
            if (this.hasBlackList(this.req)) {
                this.output('403');
                break;
            }
            this.data.type = 'login';
            this.output('login');
        break;
        case '/logout':
            delete this.req.session.user;
            this.res.redirect(302,base.sys.host);
            return this;
        break;
        default:
            this.output('404');
    }
    return this;
};

/**
 * 输出内容
 * @param {string} type
 * @param {string} other
 */
CL.fn.output = function(type,other) {
    // 如果开启了dev，每次都刷新tpl
    if (base.set.dev) {
        let template = require('./template');
        template.refreshTpl();
    }
    let _this = this;

    switch (type) {
        case 'index':
            this.class.view.setData({
                type: this.data.type,
                title: base.sys.name,
                list: watch.get()
            }).index(this.req,this.res,this.next);
        break;
        case 'login':
            this.class.view.setData({
                type: this.data.type,
                title: '用户登录'
            }).login(this.req,this.res,this.next);
        break;
        case 'file':
            this.res.sendFile(other);
        break;
        case '403':
            this.res.status(403)
                .sendFile(path.join(base.sys.projectPath,'/public/error/403.html'));
            if (base.set.dev) {
                console.log(this.req.path);
            }
        break;
        // 默认404
        default:
            this.res.status(404)
                .sendFile(path.join(base.sys.projectPath,'/public/error/404.html'));
            if (base.set.dev) {
                console.log(this.req.path);
            }
    }
    return this;
};

/**
 * 把访客加入登录黑名单
 */
CL.fn.addBlacklist = function(req) {
    let ip = base.getClientIP(req)+','+"\r\n";
    this.blacklist.push(ip);
    let savepath = path.join(base.sys.projectPath,'./data/blacklist');
    base.handlerPath(savepath);
    fs.writeFile(savepath,ip,{flag: 'a',encoding: 'utf8'},function(err) {
        if (err && base.set.dev) {
            console.log(err);
        }
    });
    return this;
};

/**
 * 检测访客是否在黑名单中
 */
CL.fn.hasBlackList = function(req) {
    let client_ip = base.getClientIP(req);
    if (this.blacklist.findIndex((ip) => {return ip == client_ip}) > -1) return true;
    return false;
};

module.exports = new OSCore();
