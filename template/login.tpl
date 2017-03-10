/**
 * @name '首页'
 * @type 'hide'
 */
 <!DOCTYPE html>
<html lang="zh">
<head>
<template:common/head />
<meta name="description" content="阳光网站状态监控台" />
</head>
<body>
<template:common/header />
<div class="login-main">
    <fieldset class="layui-elem-field layui-field-title">
        <legend>网站登录</legend>
    </fieldset>
    <form id="loginForm" class="layui-form" action="/sign/in" method="post" onsubmit="return updatePwd()">
        <% if (data.query.msg) { %>
        <div class="layui-form-item">
            <div class="layui-input-block">
                <p style="color:#f00"><i class="fa fa-exclamation-circle"></i> 密码错误</p>
            </div>
        </div>
        <% } %>
        <div class="layui-form-item">
            <label class="layui-form-label" for="username">用户名</label>
            <div class="layui-input-block">
                <input name="username" class="input layui-input" type="text" placeholder="请输入用户名">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label" for="pwd">密码</label>
            <div class="layui-input-block">
                <input id="pwd" name="pwd" class="input layui-input" type="password" placeholder="请输入密码">
                <input id="pwd2" name="password" type="hidden" />
            </div>
        </div>
        <div class="layui-form-item">
            <div class="layui-input-block">
                <button class="layui-btn">Login <i class="fa fa-sign-in"></i></button>
            </div>
        </div>
    </form>
</div>
<template:common/footer />
<template:common/foot />
<script src="/static/libs/md5/md5.js"></script>
<script>
var updatePwd = function() {
    var $form = $('#loginForm');
    var $pwd = $('#pwd');
    var $pwd2 = $('#pwd2');
    $pwd2.val(MD5($pwd.val()));
};
</script>
</body>
</html>
