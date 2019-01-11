import { UserAccountType, UserActionType } from './enums/user';

export interface UserState {
  accountType: UserAccountType;
  theme: string;
  isLoggedIn: boolean;
}

export interface UserDataAction {
  type: UserActionType;
  payload: string | boolean | UserAccountType;
}
