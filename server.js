const express = require('express'); // express 임포트
const app = express(); // app생성
const bodyParser = require('body-parser');
const cors = require("cors");
const port = 5000;
const { User } = require('./models/User'); 
const { auth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
require('dotenv').config();

// 수정
const http = require('http');
const server = http.createServer(app);
app.use(cors());

app.use(
  cors({
    origin: true,
    credentials: true, //도메인이 다른경우 서로 쿠키등을 주고받을때 허용해준다고 한다
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencode
app.use(express.json()); // application/json


// 몽구스 연결
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose
  .connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB connected!!'))
  .catch((err) => {
    console.log(err);
  });

  // var db;
  // const MongoClient = require('mongodb').MongoClient;
  // MongoClient.connect(process.env.DB_URL, function(err, client) {
  //     if(err) return console.log(err);
  //     db = client.db('todoapp');
  //     server.listen(process.env.PORT, (req, res) => {
  //         console.log("listening on 7000");
  //     });    
  // })


// 라우터 관리
app.use('/questions', require('./routes/questions.js'));
app.use('/reviews', require('./routes/reviews.js'));
app.use('/quals', require('./routes/quals.js'))


// 1.
app.get('/', function (req, res) {
  res.json('정상적으로 연결되었습니다.');
});

// 2. register api
// 회원가입에 필요한 정보들을 클라이언트에서 가져오면 그것들을 데이터베이스에 저장해야 함.
app.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true
    });
  });
});

// 3. login api

app.post("/login", (req, res) => {
  //로그인을할때 아이디와 비밀번호를 받는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.json({
        loginSuccess: false,
        message: "존재하지 않는 아이디입니다.",
      });
    }
    user
      .comparePassword(req.body.password)
      .then((isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 일치하지 않습니다",
          });
        }
        //비밀번호가 일치하면 토큰을 생성한다
        //해야될것: jwt 토큰 생성하는 메소드 작성
        user
          .generateToken()
          .then((user) => {
            res.cookie("x_auth", user.token).status(200).json({
              loginSuccess: true,
              userId: user._id,
            });
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      })``
      .catch((err) => res.json({ loginSuccess: false, err }));
  });
});

//auth 미들웨어를 가져온다
//auth 미들웨어에서 필요한것 : Token을 찾아서 검증하기
app.get("/auth", auth, (req, res) => {
  //auth 미들웨어를 통과한 상태 이므로
  //req.user에 user값을 넣어줬으므로
  res.status(200).json({
    _id: req._id,
    isAdmin: req.user.role === 09 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//user_id를 찾아서(auth를 통해 user의 정보에 들어있다) db에있는 토큰값을 비워준다
app.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    res.clearCookie("x_auth");
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`listening on port ${port}`));


  
