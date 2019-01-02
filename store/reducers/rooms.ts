import { RoomState, Room, RoomDataAction, TimeCountObject } from '../../types/room';
import { RoomsActionType } from '../../types/enums/room';

const initialState: RoomState = {
  rooms: null,
  currentHour: null,
  timeCount: null
};

export default function roomsReducer(state: RoomState = initialState, action: RoomDataAction): RoomState {
  const { type, payload } = action;

  if (type === RoomsActionType.SetRoomData) {
    return {
      ...state,
      rooms: payload as Array<Room>
    };
  }

  if (type === RoomsActionType.SetCurrentHour) {
    return {
      ...state,
      currentHour: payload as number
    };
  }

  if (type === RoomsActionType.SetTimeCount) {
    return {
      ...state,
      timeCount: payload as Array<TimeCountObject>
    };
  }


  return state;
}
