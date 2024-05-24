let mydb;

const mongoclient = require('mongodb').MongoClient;
const url = 'mongodb+srv://ononoki0117:Kuro11350@test-cluster.kmov3ip.mongodb.net/?retryWrites=true&w=majority&appName=test-cluster';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let cookieParser = require('cookie-parser');
app.use(cookieParser());
app.get('/cookie', function (req, res) {
    let milk = parseInt(req.cookies.milk) + 1000;
    if (isNaN(milk)) {
        milk = 0;
    }
    res.cookie('milk', milk, { maxAge: 1000 });
    res.send('product : ' + milk + '원');
});

let session = require('express-session');
app.use(session({
    secret: 'dkufe9',
    resave: false,
    saveUninitialized: true,
}))

app.get('/session', function (req, res) {
    if (isNaN(req.session.milk)) {
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + '원');
})

const objID = require('mongodb').ObjectId;

app.set('view engine', 'ejs');

app.use(express.static('public'));

mongoclient.connect(url).then(client => {
    console.log('몽고 db 접속 성공');

    mydb = client.db('testboard');

    app.listen(8080, function () {
        console.log("포트 8080으로 접속 대기중");
    });
}).catch(err => {
    console.log(err);
});

app.get('/', function (req, res) {
    let user;
    req.session.user ? user = req.session.user : null;
    console.log(user)
    res.render('index.ejs', { user: user });
})

app.get('/list', function (req, res) {
    mydb.collection('post').find().toArray().then(result => {
        console.log(result);
        res.render('list.ejs', { data: result });
    })

});

app.get('/enter', function (req, res) {
    res.render('enter.ejs');
});


app.get('/content/:id', function (req, res) {
    console.log(req.params.id);
    req.params.id = new objID(req.params.id);
    mydb
        .collection("post")
        .findOne({ _id: req.params.id })
        .then((result) => {
            console.log(result);
            res.render('content.ejs', { data: result });
        });
});

app.get('/edit/:id', function (req, res) {
    console.log(req.params.id);
    req.params.id = new objID(req.params.id);
    mydb
        .collection("post")
        .findOne({ _id: req.params.id })
        .then((result) => {
            console.log(result);
            res.render('edit.ejs', { data: result });
        });
});


app.get('/login', function (req, res) {
    console.log('로그인 페이지');
    if (req.session.user) {
        console.log('세션 유지');
        res.send('index.ejs', { user: req.session.user });
    } else {
        res.render('login.ejs');
    }
});

app.post('/login', function (req, res) {
    console.log('아이디 : ' + req.body.userid);
    console.log('비밀번호 : ' + req.body.userpw);

    mydb
        .collection("account")
        .findOne({ userid: req.body.userid })
        .then((result) => {
            if (result.userpw == req.body.userpw) {
                req.session.user = req.body;
                console.log('새로운 로그인');
                res.render('index.ejs', { user: req.session.user });
            } else {
                res.render('login.ejs');
            }
        });
});

app.get('/logout', function (req, res) {
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', { user: null });
})

app.get('/signup', function (req, res) {
    res.render('signup.ejs');
})

app.post('/save', function (req, res) {
    console.log(req.body.title);
    console.log(req.body.content);

    mydb.collection('post').insertOne(
        {
            title: req.body.title,
            content: req.body.content,
            date: req.body.someDate,
        }).then(result => {
            console.log(result);
            console.log('데이터 추가 성공');
        });
    console.log('저장완료');
    res.redirect('/list');
});

app.post('/edit', function (req, res) {
    console.log(req.body);
    req.body.id = new objID(req.body.id);
    mydb
        .collection('post')
        .updateOne({ _id: req.body.id }, { $set: { title: req.body.title, content: req.body.content, date: req.body.someDate } })
        .then((result) => {
            console.log('수정 완료');
            res.redirect('/list');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/delete', function (req, res) {
    console.log(req.body._id);
    req.body._id = new objID(req.body._id);
    mydb.collection('post').deleteOne(req.body)
        .then(result => {
            console.log('삭제완료');
            res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
});

