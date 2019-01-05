import { createSelector } from 'reselect';
import { StoreState } from '../../types/store';
import { Room, RoomState, TimeCountObject } from '../../types/room';

function getRooms(state: StoreState): RoomState {
  return state.roomState;
}

export const selectRoomData = createSelector<StoreState, RoomState, Array<Room>>(
  [getRooms],
  (roomState: RoomState): Array<Room> => roomState.rooms
);

export const selectCurrentHour = createSelector<StoreState, RoomState, number>(
  [getRooms],
  (roomState: RoomState): number => roomState.currentHour
);

export const selectTimeCount = createSelector<StoreState, RoomState, Array<TimeCountObject>>(
  [getRooms],
  (roomState: RoomState): Array<TimeCountObject> => roomState.timeCount
);
