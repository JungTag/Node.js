const http = require("http");
const fs = require("fs");
const url = require("url");

const templateHTML = (title, list, body) => {
  return `
	<!doctype html>
		<html>
		<head>
			<title>WEB1 - ${title}</title>
			<meta charset="utf-8">
		</head>
		<body>
			<h1><a href="/">WEB</a></h1>
			${list}
			${body}
		</body>
		</html>
	`;
};

const templateList = (files) => {
  let list = "<ul>";
  let i = 0;
  while (i < files.length) {
    list += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
    i += 1;
	}
	list += "</ul>";
	return list;
};
const app = http.createServer((request, response) => {
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const pathname = url.parse(_url, true).pathname;
  let title = queryData.id;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, files) => {
        title = "Welcome";
        desc = "Hello, Node.js";
				const list = templateList(files);
        const template = templateHTML(
          title,
          list,
          `<h2>${title}</h2><p>${desc}</p>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", (err, files) => {
				const list = templateList(files);
        fs.readFile(`data/${queryData.id}`, "utf-8", (err, desc) => {
          const template = templateHTML(
            title,
            list,
            `<h2>${title}</h2><p>${desc}</p>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
