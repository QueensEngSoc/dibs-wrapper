import * as assert from 'assert';
import { selectCurrentHour, selectRoomData, selectTimeCount } from '../../../src/store/selectors/rooms';
import { Room } from '../../../src/types/room';
import { defaultState } from '../../fixtures/defaultState';
import { StoreState } from '../../../src/types/store';

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

const defaultRoomsState: StoreState = {
  ...defaultState,
  roomState: {
    rooms: [mockRoom],
    currentHour: 12,
    timeCount: []
  }
};

describe('Rooms Selectors', () => {

  it('selectCurrentHour returns the currentHour (server time) from the state', () => {
    const data = selectCurrentHour(defaultRoomsState);
    assert.deepStrictEqual(data, defaultRoomsState.roomState.currentHour);
  });

  it('returns the roomData from the state', () => {
    const data = selectRoomData(defaultRoomsState);
    assert.deepStrictEqual(data, [mockRoom]);
  });

  it('returns the timeCount array from the state', () => {
    const data = selectTimeCount(defaultRoomsState);
    assert.deepStrictEqual(data, []);
  });

});
