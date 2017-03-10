const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
let app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
    name: 'session',
    keys: ['abc','efg'],  // 修改cookie的keys
    // maxAge: 24 * 60 * 60 * 1000
}));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

let sys = require('./system');

sys.mount(app,express);
