import { RoomsActionType, RoomState, Room } from '../../types/room';

const initialState: RoomState = {
  rooms: undefined,
  currentHour: null
};

export default function roomsReducer(state: RoomState = initialState, action): RoomState {
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

  return state;
}
