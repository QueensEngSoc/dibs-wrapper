import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import reducers from './reducers';
import thunk from 'redux-thunk';

// @ts-ignore
const preloadedState = typeof window !== 'undefined' && window.ESSDEV && window.ESSDEV.store || {};

export default (dependencies = {}) => {
  return createStore(
    reducers,
    preloadedState,
    composeWithDevTools(
      applyMiddleware(thunk.withExtraArgument(dependencies))
    )
  );
};
