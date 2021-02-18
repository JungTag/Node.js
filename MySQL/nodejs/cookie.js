const http = require("http");
const cookie = require("cookie");

http.createServer((req, res) => {
    let cookies = {};
    if (req.headers.cookie !== undefined) {
      cookies = cookie.parse(req.headers.cookie);
    }
    console.log(cookies);
    res.writeHead(200, {
      "Set-Cookie": ["yummy_cookie=choco",
        "tasty_cookie=strawberry",
        `Permanent=cookies; Max-Age=${60*60*24*30}`, // Max-Age나 Expires 사용, Max-Age = 0 -> 삭제
        'Secure=Secure; Secure', //  웹브라우저와 웹서버가 https로 통신하는 경우만 웹브라우저가 쿠키를 서버로 전송하는 옵션
        'HttpOnly=HttpOnly; HttpOnly', // 자바스크립트의 document.cookie를 이용해서 쿠키에 접속하는 것을 막는 옵션
        'Path=Path; Path=/cookie', // 해당 디렉토리와 하위 디렉토리에서만 Path가 활성화, 웹브라우저는 거기에 해당하는 쿠키만 웹서버에 전송
        'Domain=Domain; Domain=o2.org' // 서브 도메인.Domain에서도 작동하는 쿠키
    ]
    });
    res.end("Cookie!!");
  })
.listen(3000);
