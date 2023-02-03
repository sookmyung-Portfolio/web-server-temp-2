var router = require('express').Router();
var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL, function(err, client) {
    if(err) return console.log(err);
    db = client.db('todoapp');  
})


// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');

// // Connection URL
// const url = process.env.DB_URL;

// // Database Name
// const dbName = 'todoapp';

// //Use connect method to connect to the server
// MongoClient.connect(url, function(err, client) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");

//   db = client.db(dbName);

//   client.close();
// });


// 미들웨어 (마이페이지 접속전 실행할 미들웨어)
function 로그인했니 (req, res, next) {
    if(req.user) {                      // 로그인후 세션이 있으면 req.user가 항상 있는다
        next()
    } else {
        res.send('로그인안하셨는데요')
    }
}

// 글 업로드
router.post('/',(req, res, next) => {
    var date = new Date();
    // res.send('전송완료');
    // console.log(req.body.title);

    // const {title, content} = req.body;

    // try {

    // } catch (err) {
       
    // }

    db.collection('counter').findOne({name:'reviewCount'}, (error, result) => {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
    });

   
    db.collection('reviewPost').insertOne(
        {
            title : req.body.title, 
            content : req.body.content, 
            createdAt : date, 
            updatedAt : date,
            status : "created",
            // "user" : [
            //     "id" : req.user._id,
            //     "name" : req.user.name 
            // ]
        }, 
        (err, result) => {
        console.log("저장완료", req.body);
        // .updateone(요런데이터를 ,이렇게수정)
        db.collection('counter').updateOne({name:'reviewCount'}, {$inc : {totalPost : 1}}, function(err, result){
            if (err) {return console.log(err)};
        })
    });
})


// 리스트 출력
router.get('/', (req, res) => {

    var 출력조건 = [
        // {
        //   $search: {
        //     index: '님이만든인덱스명',
        //     text: {
        //       query: req.query.value,
        //       path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        //     }
        //   }
        // },
        // {$sort : {updatedAt : 1}},     // id순 정렬
        // {$limit : 10},            // 상위 10개만
        // {$project : {제목:1, _id:0, score : {$meta : "searchScore"}}} 
    ] 

    db.collection('reviewPost').find().toArray((err, result) => {
        console.log(result);
        // res.render('list.ejs', {posts : result});  // {이런이름으로 : 이런데이터를}
        res.json(result);

    });
    
})

// 글 수정 페이지 접근
router.get('/edit/:id', 로그인했니 ,(req, res) => {
    db.collection('reviewPost').findOne({_id : parseInt(req.params.id)}, function(error, result) {
        console.log(result);
        res.json(result);
    })
    // res.render('edit.ejs', {post : 결과})
    
})

// 글 수정
router.patch('/edit', 로그인했니 ,(req, res) => {
    var date = new Date();
    // updateOne (어떤게시물 수정할건지, 수정값, 콜백함수)
    // $set : 오퍼레이터다. 없데이트 해주세요 (없으면 추가해주세요)
    db.collection('reviewPost').updateOne({_id : parseInt(req.body.id)}, 
    { $set : {
        title : req.body.title, 
        user : req.user._id, 
        updatedAt : date,
        status : "updated",
        // "user" : [
            //     "id" : req.user._id,
            //     "name" : req.user.name 
            // ]
    }},
     (error, result) => {
        res.json(result);
    })
})

// 글 삭제
router.put('/:id', 로그인했니, (req, res) => {
    var date = new Date();

    // params.id -> 요청 url의 파라미터중 :id 인 게시물을 찾음
    db.collection('reviewPost').findOne({_id : parseInt(req.params.id)}, { $set : {
        title : req.body.title, 
        user : req.user._id,
        updatedAt : date, 
        deletedAt : date,
        status : "deleted",
        // "user" : [
            //     "id" : req.user._id,
            //     "name" : req.user.name 
            // ]
    }
    }, (error, result) => {
        console.log(result);
        // res.render('detail.ejs', { data : 결과});
        res.json(result);  
    }) // <<추가>> 없는 게시물 처리s - 에러코드로
    
})


// 특정 게시물 조회
router.get('/detail/:id', (req, res) => {
    // params.id -> 요청 url의 파라미터중 :id 인 게시물을 찾음
    db.collection('reviewPost').findOne({_id : parseInt(req.params.id)}, (error, result) => {
        console.log(result);
        // res.render('detail.ejs', { data : 결과});
        res.json(result);  
    }) // <<추가>> 없는 게시물 처리 - 에러코드로
    
})

module.exports = router;