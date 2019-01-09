import { Component } from 'react';
import { routes } from '../../config/clientRoutes';
import NavigationContainer from '../containers/Navigation';
import FooterContainer from "../containers/Footer";
import NotFound from './NotFound';

import { Switch, Route } from 'react-router-dom';

export default class App extends Component {
  render() {
    const routeComponents = routes.map(({ path, component, exact }, index) =>
      <Route key={`ROUTE_${index}`} exact={exact} path={path} component={component}/>
    );
    return (
      <>
        <NavigationContainer/>
        <Switch>
          {routeComponents}
          <NotFound/>
        </Switch>
        <FooterContainer/>
      </>
    );
  }
}
