import { combineReducers } from 'redux';
import roomState from './rooms';
import user from './user';

const reducers = combineReducers({
  roomState,
  user
});

export default reducers;
