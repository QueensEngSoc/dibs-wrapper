import { RoomPostData } from '../types/room';

export default function sendReq(url: string, data: object = null): RoomPostData | object {
  console.log('Sending the POST ', JSON.stringify(data));
  return fetch(url, {
    method: data ? "POST" : "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: data ? JSON.stringify(data) : undefined // body data type must match "Content-Type" header
  }).then(response => response.json());
}
