import Admin from "../src/containers/Admin";
import Book from '../src/containers/Book';
import Home from "../src/containers/Home";
import Quick from "../src/containers/Quick";

export const routes = [
  {
    path: '/',
    component: Home,
    exact: true
  },
  {
    path: '/admin-v2',
    component: Admin,
    exact: true
  },
  {
    path: '/quicky',
    component: Quick,
    exact: true
  },
  {
    path: '/book-v2/:roomName',
    component: Book,
    exact: false
  },
  {
    path: '/book-v2/:roomName/:date',
    component: Book,
    exact: true
  }
];
