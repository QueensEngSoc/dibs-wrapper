// src/template.js

export default ({ body, title, cssPath = ['/CSS/styles.css'] }) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
        <link rel="stylesheet" href="/CSS/font-awesome-all.css" />


        <!--files for offline use-->
        <link rel="stylesheet" href="/CSS/bootstrap.min.css">
        <link rel="stylesheet" href="/CSS/font-awesome-all.css">
        <script src="/JS/bootstrap.min.js"></script>
        <!--End offline section-->

        ${cssPath.map((path) => {
          return `<link rel="stylesheet" href="${path}" />`;
        }).join('\n')}

        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
      </head>
      
      <body>
        ${body}
      </body>
      
      <script src="app.bundle.js"></script>
    </html>`;
};
