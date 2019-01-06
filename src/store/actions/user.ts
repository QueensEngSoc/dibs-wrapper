import { UserDataAction } from '../../types/user';
import { UserActionType } from '../../types/enums/user';

export function setLoggedIn(payload: boolean): UserDataAction {
  return {
    type: UserActionType.SetLoggedIn,
    payload
  };
}
