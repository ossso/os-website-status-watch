<div class="header">
    <div class="container clear">
        <h1 class="logo"><i class="fa fa-send-o"></i> ${data.name}</h1>
        <% if (data.user) { %>
            <div class="userinfo">
                <img src="${data.user.avatar}" class="avatar">
                <span class="nickname">${data.user.nickname}[${data.user.level}]</span>
                <a href="/logout" class="logout">退出登录</a>
            </div>
        <% } %>
    </div>
</div>
