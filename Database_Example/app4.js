/**
 * 데이터베이스 사용하기
 * 
 * 몽고디비에 사용자 추가하기
 
 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 *    http://localhost:3000/public/adduser.html
 */

// Express 기본 모듈 불러오기
const express = require("express"),
  path = require("path");

// Express의 미들웨어 불러오기
const static = require("serve-static"),
  cookieParser = require("cookie-parser");

const expressErrorHandler = require("express-error-handler");
const expressSession = require("express-session");
const mongoose = require("mongoose");

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
let database;
let userSchema;
let userModel;

const connectDB = () => {
  const databaseUrl = "mongodb://localhost:27017/local";
  console.log("DB 연결 시도");

  // 데이터베이스 연결
  mongoose.Promise = global.Promise; // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
  mongoose.connect(databaseUrl);
  database = mongoose.connection;
  database.on(
    "error",
    console.error.bind(console, "mongoose connection error.")
  );
  database.on("open", () => {
    console.log("데이터베이스에 연결되었습니다. : " + databaseUrl);

    // 스키마 정의
    userSchema = mongoose.Schema({
      id: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, index: "hashed" },
      age: { type: Number, default: -1 },
      created_at: { type: Date, index: { unique: false }, default: Date.now },
      updated_at: { type: Date, index: { unique: false }, default: Date.now },
    });

		// 스키마에 static으로 findById 메소드 추가
		userSchema.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});
		
        // 스키마에 static으로 findAll 메소드 추가
		userSchema.static('findAll', function(callback) {
			return this.find({}, callback);
		});

    console.log("userSchema 정의함.");

    // UserModel 모델 정의
    userModel = mongoose.model("users2", userSchema);
    console.log("userModel 정의함.");
  });

  // 연결 끊어졌을 때 5초 후 재연결
  database.on("disconnected", () => {
    console.log("연결이 끊어졌습니다. 5초 후 재연결합니다.");
    setInterval(connectDB, 5000);
  });
};

//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
const router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route("/process/login").post((req, res) => {
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

// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route("/process/adduser").post((req, res) => {
  console.log("/process/adduser 호출됨.");

  const paramId = req.body.id;
  const paramPassword = req.body.password;
  const paramName = req.body.name;

  console.log(
    "요청 파라미터 : " + paramId + ", " + paramPassword + ", " + paramName
  );

  if (database) {
    addUser(database, paramId, paramPassword, paramName, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        console.dir(result);

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 추가 성공</h2>");
        res.end();
      } else {
        // 결과 객체가 없으면 실패 응답 전송
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 추가  실패</h2>");
        res.end();
      }
    });
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.end();
  }
});

//사용자 리스트 함수
router.route("/process/listuser").post((req, res) => {
  console.log("/process/listuser 호출됨.");

  // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
  if (database) {
    // 1. 모든 사용자 검색
    userModel.findAll((err, results) => {
      // 에러 발생 시, 클라이언트로 에러 전송
      if (err) {
        console.error("사용자 리스트 조회 중 에러 발생 : " + err.stack);

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트 조회 중 에러 발생</h2>");
        res.write("<p>" + err.stack + "</p>");
        res.end();

        return;
      }

      if (results) {
        // 결과 객체 있으면 리스트 전송
        console.dir(results);

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트</h2>");
        res.write("<div><ul>");

        for (let i = 0; i < results.length; i++) {
          let curId = results[i]._doc.id;
          let curName = results[i]._doc.name;
          res.write("    <li>#" + i + " : " + curId + ", " + curName + "</li>");
        }

        res.write("</ul></div>");
        res.end();
      } else {
        // 결과 객체가 없으면 실패 응답 전송
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트 조회  실패</h2>");
        res.end();
      }
    });
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.end();
  }
});

app.use("/", router);

const authUser = (database, id, password, callback) => {
  console.log("authUser 호출됨");

  userModel.findById(id, (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }

    console.log(results);

    if (results.length > 0) {
      console.log("아이디와 일치하는 사용자 찾음.");

      // 2. 패스워드 확인
      if (results[0]._doc.password === password) {
        // _doc 속성은 각 문서 객체의 정보를 담고 있다.
        console.log("비밀번호 일치함");
        callback(null, results);
      } else {
        console.log("비밀번호 일치하지 않음");
        callback(null, null);
      }
    } else {
      console.log("아이디와 일치하는 사용자를 찾지 못함.");
      callback(null, null);
    }
  });
};

const addUser = (database, id, password, name, callback) => {
  console.log(`addUser 호출됨: ${id}, ${password}, ${name}`);

  const user = new userModel({ id: id, password: password, name: name });
  user.save((err) => {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("사용자 데이터 추가");
    callback(null, user);
  });
};

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
