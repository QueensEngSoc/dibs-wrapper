import { UserActionType } from './enums/user';

export interface UserState {
  theme: string;
}

export interface UserDataAction {
  type: UserActionType;
  payload: UserState;
}
