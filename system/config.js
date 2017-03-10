// 网站设置
exports.site = {
    "host": "http://localhost:3000/",
    "hostname": "localhost",
    "name": "阳光网站状态监控台"
};

// 系统设置
exports.set = {
    'port': 3000, // 监听端口
    'dev': true, // 是否启用开发模式，线上运行需要把此处设为false
    'md5key': 'md5key', // 这里很重要，是你的密码加密的关键
    'ua': 'OSWebsiteWatch/1.0', // 模拟访问的UA，可以随便弄一个
    'user': { // 用户组，key是用户名，level是预设的权限【实际上没运用起来，不保证以后会有用】
        'admin': {
            'level': 1,
            'password': '652cc85525bdc6a004adf804b4398e37', // 找一个md5加密工具，先输入密码进行一次加密，然后加入md5key，在进行一次md5加密
        }
    }
}
