import { RoomsActionType } from './enums/room';

export interface RoomFreeTable {
  free: boolean;
  isMine?: boolean;
  owner: string | number;
  bookingHash?: string;
  time: string;
  startTime: number;
}

export interface Room {
  id: number;
  isFree: Array<RoomFreeTable> | Array<Array<RoomFreeTable>>;
  Description?: string;
  Map?: string;
  Name?: string;
  Picture?: string;
  roomID: string;
  room: string;
  roomNum: string;
  hasTV: boolean;
  hasPhone: boolean;
  size: number;
}

export interface DBRoom {
  isFree: Array<RoomFreeTable> | Array<Array<RoomFreeTable>>;
  BuildingID: number;
  Description: string;
  Map: string;
  Name: string;
  Picture: string;
  RoomID: number;
  roomNum: string;
  tv: boolean;
  size: number;
  special?: boolean;
  phone: boolean;
}

export interface TimeCountObject {
  hourCount: number;
  totalCount: number;
  timeString: string;
  totalFree: number;
  hour: number;
  twenty4Hour: number;
  pillClass: string;
}

export interface RoomState {
  rooms: Array<Room>;
  currentHour: number;
  timeCount: Array<TimeCountObject>;
}

export interface RoomDataAction {
  type: RoomsActionType;
  payload: Array<Room> | number | object;
}
