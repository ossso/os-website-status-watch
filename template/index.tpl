/**
 * @name '首页'
 * @type 'hide'
 */
 <!DOCTYPE html>
<html lang="zh">
<head>
<template:common/head />
<meta name="description" content="阳光网站状态监控台 - status.oss.so" />
</head>
<body>
<template:common/header />
<%
    let isLogin = !!data.user;
    let now = new Date();
    now = now.getTime();
%>
<div class="home container">
    <div class="title">
        <h3>网站列表</h3>
        <% if (isLogin) { %>
        <a href="javascript:activeEdit();" class="view-more" title="新增网站"><i class="fa fa-plus"></i></a>
        <% } %>
    </div>
    <div class="site-list">
        <% for (let i = 0, n = data.list.length; i < n; i++) {
            let item = data.list[i];
        %>
        <div class="site-item ${(isLogin)?'login':''} ${(item.code=='200')?'':'fail'}"
        data-ref-time="${item.time - (now - item.update)}"
        data-index="${item.index}"
        data-name="${item.name}"
        data-url="${item.url}"
        data-time="${item.time}"
        data-tips="${item.tips}"
        >
            <div class="site-info-item site-name">
                <span class="name">网站名称</span>
                <span class="value">${item.name}</span>
            </div>
            <div class="site-info-item site-url">
                <span class="name">监控地址</span>
                <span class="value"><a href="${item.url}" target="_blank" rel="nofollow">${item.url}</a></span>
            </div>
            <div class="site-info-item site-update">
                <span class="name">更新时间</span>
                <span class="value">${item.updateTime}</span>
            </div>
            <div class="site-info-item site-time">
                <span class="name">刷新间隔</span>
                <span class="value">${item.timeRule}</span>
            </div>
            <div class="site-info-item site-status">
                <span class="name">当前状态</span>
                <span class="value">
                    <% if (item.code == '200') { %>
                        <i class="fa fa-check-circle"></i> 正常
                    <% } else { %>
                        <span class="value"><i class="fa fa-exclamation-circle"></i> 异常</span>
                    <% } %>
                </span>
            </div>
            <div class="site-info-item site-ref">
                <span class="name">下次刷新</span>
                <span class="value">${item.refTime}</span>
            </div>
            <% if (item.code != '200') { %>
                <div class="site-info-item site-code">
                    <span class="name">状态代码</span>
                    <span class="value"><i class="fa fa-heartbeat"></i> ${item.code} [${item.statusName}]</span>
                </div>
                <div class="site-info-item site-code">
                    <span class="name">失败次数</span>
                    <span class="value">${item.fail.num}</span>
                </div>
            <% } %>
            <% if (isLogin) { %>
            <div class="site-option">
                <button class="layui-btn layui-btn-normal update-item">修改网站</button>
                <button class="layui-btn layui-btn-primary delete-item">删除网站</button>
            </div>
            <% } %>
        </div>
        <% } %>
        <%
        let list_len = data.list.length;
        let yushu = list_len%3;
        let nullNums = (yushu>0)?(3-yushu):0;
        for (let i = 0; i < nullNums; i++) { %>
        <div class="site-item ${(isLogin)?'login':''}"></div>
        <% } %>
    </div>
</div>

<% if (isLogin) { %>
<div class="option-form">
    <fieldset class="layui-elem-field layui-field-title">
        <legend>编辑信息</legend>
    </fieldset>
    <form id="edit" class="layui-form" action="/update" method="post">
        <input type="hidden" name="index" value="">
        <div class="layui-form-item">
            <label class="layui-form-label" for="optName">网站名称</label>
            <div class="layui-input-block">
                <input name="name" class="input layui-input" lay-verify="required" type="text" placeholder="请输入网站名称">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label" for="optName">监控地址</label>
            <div class="layui-input-block">
                <input name="url" class="input layui-input" lay-verify="url" type="text" placeholder="请输入监控地址，包含协议">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label" for="optTime">刷新时间</label>
            <div class="layui-input-block">
                <select name="time">
                    <option value="30">30分钟</option>
                    <option value="1">1分钟</option>
                    <option value="10">10分钟</option>
                    <option value="20">20分钟</option>
                    <option value="40">40分钟</option>
                    <option value="60">60分钟</option>
                </select>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label" for="optTips">报警对象</label>
            <div class="layui-input-block">
                <input name="tips" class="input layui-input" type="text" placeholder="邮箱|手机号码">
            </div>
        </div>
        <div class="layui-form-item">
            <div class="layui-input-block">
                <button class="layui-btn" lay-submit><i class="fa fa-check"></i> 保存</button>
                <button type="reset" class="layui-btn layui-btn-primary"><i class="fa fa-reply"></i> 重置</button>
            </div>
        </div>
    </form>
    <a href="javascript:closeEdit();" class="close-btn"><i class="fa fa-close"></i></a>
</div>
<div id="delete-item" style="display:none;">
<form action="/delete" method="post">
    <input type="hidden" name="index" value="" />
</form>
</div>
<% } %>
<template:common/footer />
<template:common/foot />
<script src="/static/js/index.min.js"></script>
<% if (isLogin) { %>
<script>
layui.use(['form'],function() {
    var form = window.layer_form = layui.form();
});
</script>
<% } %>
</body>
</html>
