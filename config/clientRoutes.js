import Home from "../src/containers/Home";
import Admin from "../src/containers/Admin";

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
  }
];
