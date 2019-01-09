// src/template.js

export default ({ body, title, cssPath = ['/CSS/styles.css'], compiledCss = null }) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta name="theme-color" content="#673ab7"/>
        <meta name="viewport" content="width = device-width, initial-scale = 1">
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon" />

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
        <link rel="stylesheet" href="/CSS/font-awesome-all.css" />
        <link rel="stylesheet" href="/CSS/React/Nav.css" />
        
        <!--files for offline use-->
        <!--<link rel="stylesheet" href="/CSS/bootstrap.min.css">-->
        <!--<link rel="stylesheet" href="/CSS/font-awesome-all.css">-->
        <!--<script src="/JS/bootstrap.min.js"></script>-->
        <!--End offline section-->

        ${cssPath.map((path) => {
          return `<link rel="stylesheet" href="${path}" />`;
        }).join('\n')}
        
        ${compiledCss && `<style>
            ${compiledCss}
        </style>`}

        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
        <link rel="manifest" href="/manifest.json">
      </head>
      
      <body>
        ${body}
      </body>
      
      <script src="app.bundle.js"></script>
    </html>`;
};
