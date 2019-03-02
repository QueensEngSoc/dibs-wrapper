import template from '../server/template';
import createStore from '../store/createStore';
import renderAppToString from '../server/renderAppToString';
import { compile } from '../server/compileSass';
import { setAccountType, setLoggedIn } from '../store/actions/user';
import { getAdminStatus } from '../lib/userFunctions';
import { UserAccountType } from '../types/enums/user';

const express = require('express');
const router = express.Router();

async function createStoreInstance(req) {
  const store = createStore({});
  await store.dispatch(setLoggedIn(req.isAuthenticated()));
  const accountType = getAdminStatus(req) ? UserAccountType.Admin : UserAccountType.Regular;

  await store.dispatch(setAccountType(accountType));
  return store;
}
router.get('*', async function (req, res, next) {
  const store = await createStoreInstance(req);
  const context = {};
  const { html: body, css: MuiCss } = renderAppToString(req, context, store);
  const title = 'QBook 404';
  const theme = req.theme === "custom" ? false : req.theme || 'default';
  const cssPath = [`/CSS/room-style/${theme}-room-style.css`];
  const compiledCss = compile('src/SCSS/main.scss');

  res.status(404);
  res.send(template({
    body,
    title,
    compiledCss,
    cssPath,
    MuiCss
  }));
});

export default router;
