import { UserActionType } from '../../types/enums/user';
import { UserDataAction, UserState } from '../../types/user';

const initialState: UserState = {
  theme: null,
  isLoggedIn: false
};

export default function roomsReducer(
  state: UserState = initialState,
  action: UserDataAction
): UserState {
  const { type, payload } = action;

  if (type === UserActionType.SetUserData) {
    return {
      ...state,
      theme: payload as string
    };
  }

  if (type === UserActionType.SetLoggedIn) {
    return {
      ...state,
      isLoggedIn: payload as boolean
    };
  }


  return state;
}
