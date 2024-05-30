var router = require('express').Router();

const mongoclient = require('mongodb').MongoClient;
const url = process.env.DB_URL
const objID = require('mongodb').ObjectId;

let mydb;

let multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, done) {
        done(null, './public/image')
    },
    filename: function (req, file, done) {
        done(null, file.originalname)
    }
})

let upload = multer({ storage: storage });

let imagepath = '';

mongoclient
    .connect(url)
    .then(client => {
        mydb = client.db('testboard');
    }).catch(err => {
        console.log(err);
    });


router.get('/enter', function (req, res) {
    res.render('enter.ejs');
});

router.post('/save', function (req, res) {
    console.log(req.body.title);
    console.log(req.body.content);

    mydb.collection('post').insertOne(
        {
            title: req.body.title,
            content: req.body.content,
            date: req.body.someDate,
            path: imagepath,
        }).then(result => {
            console.log(result);
            console.log('데이터 추가 성공');
        });
    console.log('저장완료');
    res.redirect('/list');
});

router.post('/photo', upload.single('picture'), function (req, res) {
    console.log(req.file.path);
    imagepath = '/' + req.file.path;
});

module.exports = router;