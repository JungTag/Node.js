module.exports = {
    html: (title, list, body, control) => {
      return `
      <!doctype html>
        <html>
        <head>
          <title>WEB - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          ${control}
          ${body}
        </body>
        </html>
      `;
    },
    list: (topics) => {
      let list = "<ul>";
      let i = 0;
      while (i < topics.length) {
        list += `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
        i += 1;
      }
      list += "</ul>";
      return list;
    }
}

