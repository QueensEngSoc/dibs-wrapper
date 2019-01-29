import { getNextValidHalfHour } from '../../models/roomDatabase';
import monk from "monk";

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
  const data = await roomDatabase.find({}).each( (data, i) => {
    if (!data.Free[0][time].free)
      return;

    out[data.Name] = {};
    out[data.Name].isSmall = data.size === 0; // allows us to favor picking small rooms
    out[data.Name].id = data.RoomID;
  });

  console.log(data, 'out= ', out);
  return data;
}
