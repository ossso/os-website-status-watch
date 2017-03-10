let base = require('./base');
let hash = require('./hash');
/**
 * 用户类
 * 用户类并没有考虑到多用户的情况，而且操作日志没有做，所以暂时比较简陋
 */
class User {
    constructor() {}

    getInfo(req) {
        this.checkUserLogin(req);
        if (!this.status) {
            return false;
        }
        return {
            'nickname': '管理员',
            'avatar': '/avatar/0.jpg',
            'level': this.getLevelName()
        }
    }

    checkUserLogin(req) {
        this.status = !!req.session.user;
        if (this.status) {
            let _user = req.session.user;
            if (base.set.user[_user]) {
                this.level = base.set.user[_user].level;
            } else {
                this.status = false;
            }
        }
        return this;
    }

    getLevelName() {
        switch (this.level) {
            case 1:
                return '超级管理员';
            default:
                return '访客';
        }
    }

    login(req,cb) {
        let username = req.body.username;
        let pwd = req.body.password;
        if (!username) {
            cb(false,'用户密码错误');
            return this;
        }
        if (!pwd) {
            cb(false,'用户密码错误');
            return this;
        }
        username = username.replace(/\s/g,'').replace(/\'/g,'');
        if (!base.set.user[username]) {
            cb(false,'用户密码错误');
            return this;
        }
        let password = hash.md5(pwd+base.set.md5key);
        if (password === base.set.user[username].password) {
            req.session.user = username;
            cb(true);
        } else {
            cb(false,'用户密码错误');
        }
        return this;
    }
}

module.exports = new User();
