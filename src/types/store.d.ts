import { RoomState } from './room';
import { UserState } from './user';

export interface StoreState {
  roomState: RoomState,
  user: UserState
}
