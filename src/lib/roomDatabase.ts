import { getNextValidHalfHour } from '../../models/roomDatabase';
import { getDisabledRoomIDs } from '../../models/adminDatabase';
import monk from 'monk';
import { ExtendedRoom, Room, RoomFreeTable } from '../types/room';
import { isValidTime } from './dateFuncs';

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

export async function getListOfRoomState(day: number, time: number, usrid: number): Promise<Array<ExtendedRoom>> {
  const listFree: Array<ExtendedRoom> = [];
  usrid = typeof usrid !== 'undefined' ? usrid : -1;

  const data = await roomDatabase.find({});
  const disabledRooms = await getDisabledRoomIDs();

  for (const roomData of data) {
    const roomNum = roomData.Name.match(/\d+/)[0]; // get the number from the room
    const mapRoomName = 'BMH' + roomNum;
    const listRoomName = 'bmh-' + roomNum;
    const isNotValidTime = time !== -1 ? !isValidTime(time) : false;

    if (isNotValidTime || disabledRooms.includes(roomData.RoomID)) {
      listFree.push({
        room: roomData.Name,
        roomNum: mapRoomName,
        roomID: listRoomName,
        Free: generateFreeTable(roomData.Free.last, 16),
        size: roomData.size,
        hasTV: roomData.tv,
        hasPhone: roomData.phone,
        id: roomData.RoomID,
        Picture: roomData.Picture
      });
    } else if (time == -1) {
      listFree.push({
        room: roomData.Name,
        roomNum: mapRoomName,
        roomID: listRoomName,
        size: roomData.size,
        hasTV: roomData.tv,
        hasPhone: roomData.phone,
        Free: roomData.Free,
        id: roomData.RoomID,
        Picture: roomData.Picture
      });
    } else {
      if (roomData.Free[day][time - 7] == undefined) {
        console.error('Error: something really bad happened!');
        console.error('Value of roomData.Free table for day ' + day + ': (broke accessing time ' + time + ')');
        console.error(roomData.Free[day]);

      } else {  // error should be caught above, and this should no longer error out.  ToDo: Make this a proper try/catch logic block later
        listFree.push({
          room: roomData.Name,
          roomNum: mapRoomName,
          roomID: listRoomName,
          size: roomData.size,
          hasTV: roomData.tv,
          hasPhone: roomData.phone,
          id: roomData.RoomID,
          Picture: roomData.Picture,
          Free: roomData.Free[day][time - 7].free,
          isMine: (roomData.Free[day][time - 7].owner == usrid)  // true if the user booked the room, false otherwise
        });
      }
    }
  }

  return listFree;
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

function parseHour(hour: RoomFreeTable, usrid): RoomFreeTable {
  if (hour.free && hour.owner === usrid)
    return { ...hour, isMine: true };

  return hour;
}

export async function getFreeTableWithUserData(roomID: string, day: number = -1, usrid: string = ''): Promise<RoomFreeTable[] | Array<Array<RoomFreeTable>>> { //gets the free table of the roomID for all days
  const freeTable = await getFreeTable(roomID, day);

  if (!usrid || !freeTable)
    return freeTable || null;

  // @ts-ignore
  freeTable.map((day) => {
    if (day.length) { // this is a multi-day array, so let's parse each hour in the array as well
      return (day as RoomFreeTable[]).map((hour) => {
        return parseHour(hour, usrid);
      });
    }

      // this is a single-day array, so we'll just parse the given day :)
      // Because this is just a single day, we know that "day" is really an hour at this point, so the map will give us what we want
      return parseHour(day as RoomFreeTable, usrid);
  });
}

export async function getFreeTable(roomID: string, day: number = -1): Promise<RoomFreeTable[] | Array<RoomFreeTable[]>> { //gets the free table of the roomID for all days
  const disabledRooms = await getDisabledRoomIDs();
  const roomData = await roomDatabase.find({ RoomID: roomID });

  if (roomData.length <= 0)
    return undefined;

  if (disabledRooms.includes(roomID)) {
    return generateFreeTable(roomData[0].Free.length, roomData[0].Free[0].length)
  }

  if (day >= 0 && day <= 13)
    return roomData[0] && roomData[0].Free[day];

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

