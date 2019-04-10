import * as assert from 'assert';
import { setCurrentHour, setRooms } from '../../../src/store/actions/rooms';
import roomsReducer from '../../../src/store/reducers/rooms';
import { Room, RoomState } from '../../../src/types/room';

const defaultState: RoomState = {
  rooms: null,
  currentHour: null,
  timeCount: null
};

const mockRoom: Room = {
  room: 'BMH 111',
  roomNum: 'BMH111',
  roomID: 'bmh-111',
  size: 3,
  hasTV: true,
  hasPhone: true,
  Free: [],
  id: 1
};

describe('Rooms reducer', () => {

  it('returns the correct default state', () => {
    const data = roomsReducer(undefined, { type: undefined, payload: undefined });
    assert.deepStrictEqual(data, defaultState);
  });

  it('reduces setRooms action', () => {
    const data = roomsReducer(undefined, setRooms([
      mockRoom
    ]));
    assert.deepStrictEqual(data, {
      ...defaultState,
      rooms: [mockRoom]
    });
  });

  it('reduces setCurrentHour action', () => {
    const data = roomsReducer(undefined, setCurrentHour(9));
    assert.deepStrictEqual(data, {
      ...defaultState,
      currentHour: 9
    });
  });

});
