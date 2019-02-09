import * as ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter as Router } from 'react-router';
import { SheetsRegistry } from 'jss';
import { JssProvider } from 'react-jss';
import App from '../components/App';
import * as React from 'react';

import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';

export default function renderAppToString(req, context, store) {
  const sheetsRegistry = new SheetsRegistry();

  // Create a sheetsManager instance.
  const sheetsManager = new Map();

  // Create a theme instance.
  const theme = createMuiTheme({
    // palette: {
    //   primary: green,
    //   accent: red,
    //   type: 'light',
    // },
    typography: {
      useNextVariants: true,
    },
  });

  // Create a new class name generator.
  const generateClassName = createGenerateClassName();

  const appString = ReactDOM.renderToString(
    <Provider store={store}>
      <Router context={context} location={req.url}>
        <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
          <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
            <App />
          </MuiThemeProvider>
        </JssProvider>
      </Router>
    </Provider>
  );

  const storeScript = `<script>
    window.ESSDEV = {};
    window.ESSDEV.store = ${JSON.stringify(store.getState()).replace(
    /</g,
    '\\u003c'
  )};</script>`;

  return { html: `<div id="main" role="main">${appString}</div>` + storeScript, css: sheetsRegistry.toString() };
}
