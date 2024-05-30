const dotenv = require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let cookieParser = require('cookie-parser');
app.use(cookieParser());

let session = require('express-session');
app.use(session({
    secret: 'dkufe9',
    resave: false,
    saveUninitialized: true,
}))

app.set('view engine', 'ejs');

const objID = require('mongodb').ObjectId;
let mydb;
const mongoclient = require('mongodb').MongoClient;
const url = process.env.DB_URL
mongoclient.connect(url).then(client => {
    console.log('몽고 db 접속 성공');

    mydb = client.db(process.env.DB_NAME);

    app.listen(process.env.PORT, function () {
        console.log("포트 " + process.env.PORT + "으로 접속 대기중");
    });
}).catch(err => {
    console.log(err);
});

app.use('/', require('./routes/add.js'))
app.use('/', require('./routes/auth.js'))
app.use('/', require('./routes/post.js'))

app.get('/', function (req, res) {
    let user;
    req.session.user ? user = req.session.user : null;
    console.log(user)
    res.render('index.ejs', { user: user });
})
