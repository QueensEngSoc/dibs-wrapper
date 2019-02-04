import Home from "../src/containers/Home";
import Admin from "../src/containers/Admin";
import Quick from "../src/containers/Quick";

export const routes = [
  {
    path: '/react',
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
  }
];
