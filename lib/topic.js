const db = require('./db');
const template = require("./template.js")

exports.home = (request, response) => {
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
};
