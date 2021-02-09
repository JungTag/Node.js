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
    },
    authorSelect: (authors, author_id) => {
      let tag = '';
      for(let i=0; i < authors.length; i++) {
        let selected = '';
        if(authors[i].id === author_id) {
          selected = ' selected';
        }
        tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      }
      return `
        <select name="author">
          ${tag}
        </select>
      `
    },
}

