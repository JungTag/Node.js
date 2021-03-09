/**
 * 데이터베이스 사용하기
 * 
 * 몽고디비에 연결하고 클라이언트에서 로그인할 때 데이터베이스 연결하도록 만들기
 
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 *    http://localhost:3000/public/login.html
 */

// Express 기본 모듈 불러오기
const express = require("express"),
  path = require("path");

// Express의 미들웨어 불러오기
const static = require("serve-static"),
  cookieParser = require("cookie-parser");

const expressErrorHandler = require("express-error-handler");
const expressSession = require("express-session");

// 익스프레스 객체 생성
const app = express();
const PORT = 3000;

// 기본 속성 설정
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

//===== 데이터베이스 연결 =====//
const mongoClient = require("mongodb").MongoClient;
let database;

const connectDB = () => {
  const databaseUrl = "mongodb://localhost:27017/local";

  mongoClient.connect(databaseUrl, (err, db) => {
    if (err) throw err;
    console.log(`DB에 연결: ${databaseUrl}`);
    database = db.db("local"); // mongodb 버전 3.0이상을 사용할 때는, connection을 할 때에 database명을 명시해야 한다
  });
};

//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
const router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
app.post("/process/login", (req, res) => {
  console.log("/process/login 호출됨.");

  const paramId = req.body.id;
  const paramPassword = req.body.password;

  console.log(`요청 파라미터 : ${paramId}, ${paramPassword}`);

  // 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
  if (database) {
    authUser(database, paramId, paramPassword, (err, docs) => {
      if (err) {
        throw err;
      }

      // 조회된 레코드가 있으면 성공 응답 전송
      if (docs) {
        console.dir(docs);

        // 조회 결과에서 사용자 이름 확인
        const username = docs[0].name;

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인 성공</h1>");
        res.write("<div><p>사용자 아이디 : " + paramId + "</p></div>");
        res.write("<div><p>사용자 이름 : " + username + "</p></div>");
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      } else {
        // 조회된 레코드가 없는 경우 실패 응답 전송
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인  실패</h1>");
        res.write("<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>");
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      }
    });
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.write("<div><p>데이터베이스에 연결하지 못했습니다.</p></div>");
    res.end();
  }
});

const authUser = (database, id, password, callback) => {
  console.log(`authUser 호출됨: ${id} ${password}`);
  const users = database.collection("users");
  users.find({"id":id, "password":password}).toArray((err, docs) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (docs.length > 0) {
      // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
      console.log(
        `아이디 ${id}, 패스워드 ${password} 가 일치하는 사용자 찾음.`
      );
      callback(null, docs);
    } else {
      // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
      console.log("일치하는 사용자를 찾지 못함.");
      callback(null, null);
    }
  });
}

const errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Express 서버 시작
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  connectDB();
});
