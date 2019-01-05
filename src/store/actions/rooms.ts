import { Room, RoomDataAction, TimeCountObject } from '../../types/room';
import { RoomsActionType } from '../../types/enums/room';

export function setRooms(payload: Array<Room>): RoomDataAction {
  return {
    type: RoomsActionType.SetRoomData,
    payload
  };
}

export function setCurrentHour(payload: number): RoomDataAction {
  return {
    type: RoomsActionType.SetCurrentHour,
    payload
  };
}

export function setTimeCount(payload: Array<TimeCountObject>): RoomDataAction {
  return {
    type: RoomsActionType.SetTimeCount,
    payload
  };
}
