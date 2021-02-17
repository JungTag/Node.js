const http = require('http');

// 호출 페이지 정보 설정
const options = { 
    host: "127.0.0.1",
    port: 8000,
    path: "/"
};

const req = http.request(options, (res) => {  // 페이지 호출
    let data = "";  
    res.on('data', (chunk) => {   // 서버가 보내는 데이터 수신
        data += chunk;
    });
    res.on('end', () => {  // 수신 완료하면 화면에 출력
        console.log(data); 
    })
});

req.end();  // 명시적 완료