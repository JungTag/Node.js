const http = require('http');

const server = http.createServer((req, res) => {    // createServer 함수를 이용해 인스턴스 생성
    res.end("hello world");
})

server.listen(8000);
