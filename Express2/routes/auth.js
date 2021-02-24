const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template.js');

module.exports = function (passport) {
  router.get('/login', function(request, response){
    const title = 'WEB - login';
    const list = template.list(request.list);
    const html = template.HTML(title, list, `
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `, '');
    response.send(html);
  });
  
  router.post(
    "/login_process",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
    })
  );
  
  /*
  router.post('/login_process', function (request, response) {
      const post = request.body;
      const email = post.email;
      const password = post.pwd;
      if(email === authData.email && password === authData.password){
          request.session.is_logined = true;
          request.session.nickname = authData.nickname;
          request.session.save(() => {
              response.redirect('/');
          });
      } else {
        response.send('Who?');
      }
      // response.redirect(`/topic/${title}`);
  });
  */
  
  router.get('/logout', function(request, response){
    request.logout();
    request.session.save(() => {
      response.redirect('/');
    })
    });
    return router;
}
