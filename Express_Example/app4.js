/**
 * 미들웨어에서 응답할 때 send 메소드 사용하기
 */

// Express 기본 모듈 불러오기
var express = require('express');

// 익스프레스 객체 생성
var app = express();

// 미들웨어에서 응답 전송할 때 send 메소드 사용하여 JSON 데이터 전송
app.use(function(req, res, next) {
	console.log('첫번째 미들웨어에서 요청을 처리함.');
	
	res.send({name:'소녀시대', age:20});
});


// Express 서버 시작
app.listen(3000, function(){
  console.log('Express 서버가 3000번 포트에서 시작됨.');
});


