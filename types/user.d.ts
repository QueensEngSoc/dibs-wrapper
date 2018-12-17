export enum UserActionType {
  SetUserData = 'SetUserData'
}

export interface UserState {
  theme: string;
}

export interface UserDataAction {
  type: UserActionType;
  payload: UserState;
}
