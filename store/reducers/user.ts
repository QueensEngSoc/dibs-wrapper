import { UserActionType, UserDataAction, UserState } from '../../types/user';

const initialState: UserState = {
  theme: null
};

export default function roomsReducer(
  state: UserState = initialState,
  action: UserDataAction
): UserState {
  const { type, payload } = action;

  if (type === UserActionType.SetUserData) {
    return {
      ...state,
      theme: payload.theme as string
    };
  }

  return state;
}
