const path = require('path');
let base = require('./base');
let template = require('./template');
let user = require('./user');

class View {
    constructor() {
        this.data = {
            view: this,
            name: base.sys.name,
            host: base.sys.host,
            hostname: base.sys.hostname
        }
    }

    setData(options) {
        this.data = Object.assign({}, this.data, options);
        return this;
    }

    common(req) {
        this.setData({
            user: user.getInfo(req),
            query: Object.assign({}, req.query)
        });
        return this;
    }

    title() {
        let fgf = '-';
        switch (this.data.type) {
            case 'index':
            case 'login':
                return this.data.title
            default:
                return this.data.name
        }
    }


    /**
     * 输出首页
     * @param {object} req
     * @param {object} res
     * @param {object} next
     */
    index(req, res, next) {
        this.common(req);
        let html = template.renderTpl('index', Object.assign({}, this.data));
        html = this.filterLineFeed(html);
        res.send(html);
    }

    login(req, res, next) {
        this.common(req);
        let html = template.renderTpl('login', Object.assign({}, this.data));
        html = this.filterLineFeed(html);
        res.send(html);
    }
}

/**
 * 过滤html代码中的多余换行符
 * @param {string} htmlCode
 */
View.prototype.filterLineFeed = function(htmlCode) {
    htmlCode = htmlCode.replace(/[\r|\n]{1,}\s*[\r|\n]/g, "\n")
    return htmlCode
}

module.exports = new View();
