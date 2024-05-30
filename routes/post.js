var router = require('express').Router();

const mongoclient = require('mongodb').MongoClient;
const url = process.env.DB_URL
const objID = require('mongodb').ObjectId;

let mydb;

mongoclient
    .connect(url)
    .then(client => {
        mydb = client.db('testboard');
    }).catch(err => {
        console.log(err);
    });

router.get("/list", function (req, res) {
    mydb.collection('post')
        .find()
        .toArray()
        .then(result => {
            console.log(result);
            res.render('list.ejs', { data: result });
        });
});

router.post('/delete', function (req, res) {
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

router.post('/edit', function (req, res) {
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

router.get('/edit/:id', function (req, res) {
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

router.get('/content/:id', function (req, res) {
    console.log(req.params.id);
    req.params.id = new objID(req.params.id);
    mydb
        .collection("post")
        .findOne({ _id: req.params.id })
        .then((result) => {
            console.log(result);
            let imagePath = result.path.replace("/public/image/", "/image/");
            res.render('content.ejs', { data: { ...result, path: imagePath } });
        });
});


router.get('/search', function (req, res) {
    console.log(req.query);
    mydb
        .collection("post")
        .find({ title: req.query.value }).toArray()
        .then((result) => {
            console.log(result);
            result.forEach(element => {
                if (element.path) {
                    element.path = element.path.replace("/public/image/", "/image/");
                }
            });
            res.render('sresult.ejs', { data: result });
        })
})

module.exports = router;