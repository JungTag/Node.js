const express = require('express')
const parseurl = require('parseurl')
const session = require('express-session')
var FileStore = require('session-file-store')(session);

const app = express()

app.use(session({ // session() 함수가 실행되면 세션이 시작
  secret: 'keyboard cat', // 자신만이 알고 있어야 함, 버전관리를 할 땐 별도의 파일로 분리
  resave: false, // false: 세션데이터가 바뀌기 전까진 세션저장소의 값을 저장하지 않는다.
  saveUninitialized: true, // true: 세션이 필요하기 전까지는 세션을 구동하지 않는다.
  store: new FileStore()
}))
// req객체의 session 프로퍼티에 객체를 추가

app.get('/', function (req, res, next) {
    console.log(req.session);
    if(req.session.num === undefined){
        req.session.num = 1; // 세션저장소에 num=1 저장, 세션저장소는 메모리에 저장(휘발성)
    } else {
        req.session.num =  req.session.num + 1;
    }
    res.send(`Views : ${req.session.num}`);
})

app.listen(3000, () => {
    console.log("server on");
})