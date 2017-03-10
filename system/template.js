/**
 * 模板引擎
 * 基于本项目[阳光网站状态监控台]目录设定
 * 注意，这个是橙色阳光自己构造的模板引擎，并非流行引擎
 */
let fs = require('fs');
let path = require('path');
let os = require('os');
let base = require('./base');
class Template {
    constructor() {
        this.data = {}
        this.status = {}
        this.tpl = {}
        this.tps = {}
        this._loadTpl()
    }

    getTplList() {
        if (this.status._loadTpl) {
            return this.tpl
        }
        return false
    }

    getTpsList() {
        if (this.status._loadTps) {
            return this.tps
        }
        return false
    }

    /**
     * 获取模板的内容
     * @param {string} key
     */
    getTpl(key) {
        // windows和unix系统对路径的读取方法是不一样的，根据操作系统，我们区分斜杠和反斜杠，此处就直接替换key中的斜杠了
        if (os.type() == 'Windows_NT') {
            key = key.replace(/\//g,'\\')
        } else {
            key = key.replace(/\\/g,'/')
        }
        if (this.status._loadTpl) {
            return this.tpl[key]
        }
        return false
    }

    /**
     * 获取模板的路径
     * @param {string} key
     */
    getTps(key) {
        if (os.type() == 'Windows_NT') {
            key = key.replace(/\//g,'\\')
        } else {
            key = key.replace(/\//g,'/')
        }
        if (this.status._loadTps) {
            return this.tps[key]
        }
        return false
    }

    /**
     * 刷新模板缓存内容
     */
    refreshTpl() {
        this.status._loadTps = false
        this._loadTpl()
    }
}

/**
 * 递归获取模板路径 同步获取
 * @param {string} path
 * @param {string} pathname
 */
Template.prototype._getTempPath = function(loadpath,pathname) {
    let dirs = fs.readdirSync(loadpath)
    for (let i = 0, n = dirs.length; i < n; i++) {
        let _path = path.join(loadpath,dirs[i])
        if (fs.statSync(_path).isDirectory()) {
            this._getTempPath(_path,path.join(pathname,dirs[i]))
        } else if (dirs[i].lastIndexOf('.tpl') == dirs[i].length - 4) {
            var temp = dirs[i].split('.')
            this.tps[path.join(pathname,temp[0])] = path.join(loadpath,dirs[i])
        }
    }
    return this
}

/**
 * 获取模板Tps
 */
Template.prototype._loadTps = function() {
    let _this = this
    this.tps = {}
    let loadpath = path.join(base.sys.projectPath,base.tpl.path,'template')
    if (!fs.existsSync(loadpath)) {
        if (base.set.dev) {
            console.log('主题不存在')
        }
        return this
    }
    this._getTempPath(loadpath,'')
    this.status._loadTps = true
    return this
}


/**
 * 读取模板文件到内存
 */
Template.prototype._loadTpl = function() {
    if (!this.status._loadTps) {
        this._loadTps()
    }
    for (let i in this.tps) {
        this.tpl[i] = this.__handlerTpl(this.tps[i])
    }
    this.status._loadTpl = true
    return this
}

/**
 * 处理模板文件读取缓存到内存中
 * 后期采用Redis缓存
 * @param {string} _path
 */
Template.prototype.__handlerTpl = function(_path) {
    let objs = {
        'name': '',
        'type': 'hide',
        'content': ''
    }
    if (_path) {
        // 匹配全部注释
        let _reg = /\/\*[\s|\S]*\*\//g
        // 匹配提示注释
        let _reg2 = /\/\*[\s|\S]*@name\s[\'|\"]+(\s|\S*)[\'|\"]+[\s|\S]*@type\s[\'|\"]+(\s|\S*)[\'|\"]+[\s|\S]*\*\//i
        let data = fs.readFileSync(_path,'utf-8')
        if (data) {
            let matchs = data.match(_reg2)
            if (matchs == null) {
                objs.content = data.replace(_reg,'')
            } else {
                objs.name = matchs[1]
                objs.type = matchs[2]
                objs.content = data.replace(_reg,'')
            }
        }
    }
    return objs
}

/**
 * 渲染模板
 * @param {string} tplName
 * @param {object} data
 * @param {object} view
 */
Template.prototype.renderTpl = function(tplName,data) {
    let htmlCode = this.getTplContent(tplName)
    return this.tplCompile(htmlCode,data)
}

/**
 * 读取tpl的html，并替换template的引入
 * @param {string} tplName
 */
Template.prototype.getTplContent = function(tplName) {
    let tplReg = /<template:([a-z0-9_-|\/]*)\s*\/>/
    let tpl = this.getTpl(tplName)
    if (!tpl) {
        if (base.set.dev) {
            console.log(tplName+' 不存在');
            console.log(this.tps);
        }
        return ''
    }
    let htmlCode = tpl.content
    let tplCodes = htmlCode.match(new RegExp(tplReg,'g'))
    if (tplCodes) {
        for (let i = 0, n = tplCodes.length; i < n; i++) {
            let key = tplCodes[i].match(tplReg)[1].replace(/\s/g,'')
            let _html = this.getTplContent(key)
            htmlCode = htmlCode.replace(tplCodes[i],_html)
        }
    }
    return htmlCode
}

/**
 * 模板解析
 * @param {string} tpl
 * @param {object} data
 */
Template.prototype.tplCompile = function(tpl,data){
    let evalReg = /<%([\s\S]+?)%>/g
    let varsReg = /\$\{(.+?)\}/g

    tpl = tpl.replace(evalReg,'\`); \n $1 \n echo(\`')
            .replace(varsReg,'$${$1}')

    tpl = 'echo(\`'+tpl+'\`);'


    let str = `(function(data) {
        let htmlcode = ''
        let echo = function(html) {
            htmlcode += html
        }
        ${tpl}
        return htmlcode
    })`

    return eval(str+'(data)')
}

let template = new Template()

module.exports = template
