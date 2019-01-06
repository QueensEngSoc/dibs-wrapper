import { UserActionType } from './enums/user';

export interface UserState {
  theme: string;
  isLoggedIn: boolean;
}

export interface UserDataAction {
  type: UserActionType;
  payload: string | boolean;
}
