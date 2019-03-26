import { getNextValidHalfHour } from '../../models/roomDatabase';
import { getDisabledRoomIDs } from '../../models/adminDatabase';
import monk from 'monk';
import { Room, RoomFreeTable } from '../types/room';

const env = process.env.NODE_ENV || 'dev';

let db;
if (env == 'dev') {
  db = monk('localhost:27017/roomDatabase');
} else {
  db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');
}

const roomDatabase = db.get('roomDatabase');

export async function getAllFreeNow() {
  const time = getNextValidHalfHour(false, true);
  const out = {};
  const data = await roomDatabase.find({}).each((data, i) => {
    if (!data.Free[0][time].free)
      return;

    out[data.Name] = {};
    out[data.Name].isSmall = data.size === 0; // allows us to favor picking small rooms
    out[data.Name].id = data.RoomID;
  });

  console.log(data, 'out= ', out);
  return data;
}

export async function getInfoByName(roomName): Promise<Room> { //gets the info of the selected room (roomName)
  try {
    const roomInfo = await roomDatabase.findOne({ Name: roomName });
    return {
      id: roomInfo.roomid,
      Free: roomInfo.Free,
      Description: roomInfo.Description,
      Map: roomInfo.Map,
      Name: roomInfo.Name,
      Picture: roomInfo.Picture,
      roomID: roomInfo.RoomID,
      hasTV: roomInfo.tv,
      hasPhone: roomInfo.phone,
      size: roomInfo.size,
      roomNum: roomInfo.roomid,
      room: roomName
    };

  } catch (err) {    // the room was not found!
    console.error('No Room Found called ' + roomName);
    return null;
  }
}

export async function getFreeTable(roomID: string): Promise<Array<Array<RoomFreeTable>>> { //gets the free table of the roomID for all days
  const disabledRooms = await getDisabledRoomIDs();
  const roomData = await roomDatabase.find({ RoomID: roomID });

  if (roomData.length <= 0)
    return undefined;

  if (disabledRooms.includes(roomID)) {
    return generateFreeTable(roomData[0].Free.length, roomData[0].Free[0].length)
  }

  return roomData[0] && roomData[0].Free;
}

function createNewFreeTable(length: number, isFree: boolean): Array<RoomFreeTable> {
  const newFreeTable: Array<RoomFreeTable> = new Array(length);
  for (let i = 0; i < length; i++) {
    newFreeTable[i] = {
      free: isFree,
      time: ((7 + i) >= 10 ? (7 + i) : '0' + (7 + i)) + ':30 - ' + ((8 + i) >= 10 ? (8 + i) : '0' + (8 + i)) + ':30',
      startTime: 7 + i,
      owner: 0,
    };
  }
  return newFreeTable;
}

export function generateFreeTable(days: number, dayLength: number): Array<Array<RoomFreeTable>> {
  const newFreeTable: Array<Array<RoomFreeTable>> = new Array(days);
  for (let j = 0; j < days; j++) {
    const curDay: Array<RoomFreeTable> = new Array(dayLength);

    for (let i = 0; i < dayLength; i++) {
      curDay[i] = {
        free: false,
        time: ((7 + i) >= 10 ? (7 + i) : '0' + (7 + i)) + ':30 - ' + ((8 + i) >= 10 ? (8 + i) : '0' + (8 + i)) + ':30',
        startTime: 7 + i,
        owner: 0,
        bookingHash: ''
      };
    }
    newFreeTable[j] = curDay;
  }
  return newFreeTable;
}

