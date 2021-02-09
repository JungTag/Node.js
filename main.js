const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'opentutorials'
});
db.connect();

const template = require("./lib/template.js")

const app = http.createServer((request, response) => {
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const pathname = url.parse(_url, true).pathname;
  const qs = require('querystring');

  if (pathname === "/") {
    if (queryData.id === undefined) {
      db.query(`SELECT * FROM topic`, (err, topics) => {
        const title = "Welcome";
        const desc = "Hello, Node.js";
        const list = template.list(topics);
        const html = template.html(
          title,
          list,
          `<h2>${title}</h2><p>${desc}</p>`,
          `<a href="/create">create</a>`
        );        
        response.writeHead(200);
        response.end(html);
      });
    } else {
     db.query(`SELECT * FROM topic`, (err, topics) => {
       if(err) {
         throw err;
       }
      db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (err2, topic) => {
        if(err2) {
          throw err2;
        }
        const title = topic[0].title;
        const desc = topic[0].description;
        const list = template.list(topics);
        const html = template.html(
          title,
          list,
          `<h2>${title}</h2><p>${desc}</p>`,
          `<a href="/create">create</a>
          <a href="/update?id=${queryData.id}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${queryData.id}">
            <input type="submit" value="delete">
          </form>`
        );        
        response.writeHead(200);
        response.end(html);
      });
    });
    }
  } else if (pathname === "/create") {

    db.query(`SELECT * FROM topic`, (err, topics) => {
      const title = "Create";
      const list = template.list(topics);
      const html = template.html(
        title,
        list,
        `
        <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
         <p>
         <textarea name="description" placeholder="description"></textarea>
         </p>
       <p><input type="submit"></p>
       </form> 
        `,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);   
    });
  } else if(pathname === '/create_process') {
    let body = '';
    request.on('data', (data) => {
      body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body); // 정보를 객체화시킴
      db.query(`INSERT INTO topic
      (title, description, created, author_id) 
      VALUES (?, ?, NOW(), ?)`,
      [post.title, post.description, 1],
      (err, result) => {
        if(err) {
          throw err;
        }
        response.writeHead(302, {Location: `/?id=${result.insertId}`});
        response.end();
      })
    });
  } else if(pathname === '/update') {    
    db.query('SELECT * FROM topic', (err, topics) => {
      if (err) {
        throw err;
      }
      db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (err2, topic) => {
        if (err2) {
          throw err2;
        }
        const list = template.list(topics);
        const html = template.html(
          topic[0].title,
          list,
          `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${topic[0].id}">
          <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
           <p>
           <textarea name="description" placeholder="description">${topic[0].description}</textarea>
           </p>
          <p><input type="submit"></p>
          </form> 
          `,
          `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if(pathname === '/update_process') {
    let body = '';
    request.on('data', (data) => {
      body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body); // 정보를 객체화시킴
      db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], (err, result) => {
        response.writeHead(302, {Location: `/?id=${post.id}`});
        response.end();        
      })
    });
  } else if(pathname === '/delete_process') {
    let body = '';
    request.on('data', (data) => {
      body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body); // 정보를 객체화시킴
      db.query('DELETE FROM topic WHERE id=?', [post.id], (err, result) => {
        response.writeHead(302, {Location: `/`});
        response.end();        
      });
    });
  }
  else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
