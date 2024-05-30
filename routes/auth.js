var router = require('express').Router();

const mongoclient = require('mongodb').MongoClient;
const url = process.env.DB_URL
const objID = require('mongodb').ObjectId;

let mydb;

mongoclient
    .connect(url)
    .then(client => {
        mydb = client.db(process.env.DB_NAME);
    }).catch(err => {
        console.log(err);
    });

router.get('/login', function (req, res) {
    console.log('로그인 페이지');
    if (req.session.user) {
        console.log('세션 유지');
        res.send('index.ejs', { user: req.session.user });
    } else {
        res.render('login.ejs');
    }
});

router.post('/login', function (req, res) {
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

router.get('/logout', function (req, res) {
    console.log('로그아웃');
    req.session.destroy();
    res.render('index.ejs', { user: null });
})

router.get('/signup', function (req, res) {
    res.render('signup.ejs');
})

router.get('/cookie', function (req, res) {
    let milk = parseInt(req.cookies.milk) + 1000;
    if (isNaN(milk)) {
        milk = 0;
    }
    res.cookie('milk', milk, { maxAge: 1000 });
    res.send('product : ' + milk + '원');
});

router.get('/session', function (req, res) {
    if (isNaN(req.session.milk)) {
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    res.send("session : " + req.session.milk + '원');
})

module.exports = router;