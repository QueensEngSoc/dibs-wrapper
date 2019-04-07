// src/template.js

export default ({ body, title, cssPath = [''], compiledCss = null, MuiCss = null }) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta name="theme-color" content="#673ab7"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="Description" content="Welcome to QBook, the new ILC room booking system built by the ESSDEV team! Book rooms for the next 7 days, anytime on QBook">
        <meta name="google-site-verification" content="l_NsHLZEl7XYLX5-9RPTVDQfMYpSwNI0HNI6Mjko4oc" />

        <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon" />

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />

        ${cssPath.map((path) => {
          return `<link rel="stylesheet" href="${path}" />`;
        }).join('\n')}
        
        ${compiledCss && `<style>
            ${compiledCss}
        </style>`}
        
        ${MuiCss && `<style id="jss-server-side">${MuiCss}</style>`}

        <!--<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>-->
        <link rel="manifest" href="/manifest.json">
      </head>
      
      <body>
        ${body}
      </body>
      
      <script src="/app.bundle.js"></script>
    </html>`;
};
