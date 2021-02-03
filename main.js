const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");
const sanitizeHtml = require('sanitize-html');

const template = require("./lib/template.js")

const app = http.createServer((request, response) => {
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const pathname = url.parse(_url, true).pathname;
  const qs = require('querystring');

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, files) => {
        const title = "Welcome";
        const desc = "Hello, Node.js";
        const list = template.list(files);
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
      fs.readdir("./data", (err, files) => {
        const filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf-8", (err, desc) => {
          const title = queryData.id;
          const sanitizedTitle = sanitizeHtml(title);
          const sanitizedDesc = sanitizeHtml(desc, {
            allowedTags: ['h1']
          });
          const list = template.list(files);
          const html = template.html(
            title,
            list,
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDesc}</p>`,`
            <a href="/create">create</a>
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>
            `
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (err, files) => {
      const title = "WEB = create";
      const list = template.list(files);
      const html = template.html(title, list, `
        <form action="/create_process" method="post">
         <p><input type="text" name="title" placeholder="title"></p>
          <p>
          <textarea name="description" placeholder="description"></textarea>
          </p>
        <p><input type="submit"></p>
        </form> 
        `, '');
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
      const title = post.title;
      const description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf-8', err => {
        if (err) 
          return console.log(err);
        else {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        }
      });
    });
  } else if(pathname === '/update') {    
    fs.readdir("./data", (err, files) => {
      const filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf-8", (err, desc) => {
        const title = queryData.id;
        const list = template.list(files);
        const html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
           <p>
           <textarea name="description" placeholder="description">${desc}</textarea>
           </p>
          <p><input type="submit"></p>
          </form> 
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
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
      const id = post.id;
      const title = post.title;
      const description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, err => {
        if (err) 
          return console.log(err);
        else {
          fs.writeFile(`data/${title}`, description, 'utf-8', err => {
            if (err) 
              return console.log(err);
            else {
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            }
          });
        }
      });
    });
  } else if(pathname === '/delete_process') {
    let body = '';
    request.on('data', (data) => {
      body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body); // 정보를 객체화시킴
      const id = post.id;
      const filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, () => {
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  }
  else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
