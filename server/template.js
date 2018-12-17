// src/template.js

export default ({ body, title, cssPath = ['/CSS/styles.css'] }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${cssPath.map((path) => {
          return `<link rel="stylesheet" href="${path}" />`;
        }).join('\n')}
      </head>
      
      <body>
        <div id="root">${body}</div>
      </body>
      
      <script src="app.bundle.js"></script>
    </html>
  `;
};
