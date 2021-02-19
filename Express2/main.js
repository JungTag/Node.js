const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require('compression');
const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const helmet = require('helmet');
const session = require('express-session');
var FileStore = require('session-file-store')(session);

// middleware
app.use(helmet())
app.use(express.static('public')); // public 폴더 아래에서 정적인 파일을 찾겠다
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({ // session() 함수가 실행되면 세션이 시작
  secret: 'keyboard cat', // 자신만이 알고 있어야 함, 버전관리를 할 땐 별도의 파일로 분리
  resave: false, // false: 세션데이터가 바뀌기 전까진 세션저장소의 값을 저장하지 않는다.
  saveUninitialized: true, // true: 세션이 필요하기 전까지는 세션을 구동하지 않는다.
  store: new FileStore()
}))

app.get('*',(req, res, next) => { // get방식으로 들어오는 모든 요청에 한해
  fs.readdir("./data", (error, filelist) => {
    req.list = filelist;
    next(); // 다음 미들웨어를 실행
  });
});

// route, routing
app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);


app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log("Example app listening on port 3000!");
});