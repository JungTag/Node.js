module.exports = function (app) {
  const authData = {
    email: "egoing777@gmail.com",
    password: "111111", // 실제론 해시 등의 암호화 필요!!
    nickname: "egoing",
  };

  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    // 로그인에 성공했을 때, 사용자의 정보를 세션스토어에 저장하는 역할 (딱 한 번 호출)
    console.log("serializeUser", user);
    done(null, user.email); // 식별자를 user.email로 지정
  });

  passport.deserializeUser(function (id, done) {
    // 페이지를 방문할 때마다 세션 스토어에 있는 식별자를 가져와서, 그 식별자를 기준으로 사용할 데이터를 조회한다.
    console.log("deserializeUser", id);
    done(null, authData); // 요청 객체에 authData에 전달
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "pwd",
      },
      function (username, password, done) {
        console.log(username, password);
        if (username === authData.email) {
          console.log(1);
          if (password === authData.password) {
            console.log(2);
            return done(null, authData);
          } else {
            console.log(3);
            return done(null, false, {
              message: "Incorrect password.",
            });
          }
        } else {
          console.log(4);
          return done(null, false, {
            message: "Incorrect username.",
          });
        }
      }
    )
  );
  return passport;
};
